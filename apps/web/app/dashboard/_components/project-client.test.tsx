import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { getFunctionName } from "convex/server";

const replace = mock(() => {});
const push = mock(() => {});
const router = { replace, push };
const searchParams = new URLSearchParams();
let deleteResult: Promise<unknown>;
const deleteProject = mock(() => deleteResult);
const syncUser = async () => {};
const rotateKey = mock(async () => {
  throw new Error("request failed");
});
const updateAllowedOrigins = mock(async () => {
  throw new Error("invalid origin");
});
const project = {
  _id: "project-test",
  name: "Recovery test",
  mode: "development",
  allowedOrigins: [],
  createdAt: 1,
};

mock.module("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/dashboard/projects/project-test",
  useParams: () => ({ projectId: project._id }),
  useSearchParams: () => searchParams,
}));

mock.module("convex/react", () => ({
  useConvexAuth: () => ({ isLoading: false, isAuthenticated: true }),
  useQuery: (query: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip") return undefined;
    if (getFunctionName(query) === "projects:getProject") {
      return { project, activeApiKey: { key: "pk_test_fixture" } };
    }
    return undefined;
  },
  useMutation: (mutation: Parameters<typeof getFunctionName>[0]) => {
    if (getFunctionName(mutation) === "projects:deleteProject") {
      return deleteProject;
    }
    if (getFunctionName(mutation) === "projects:generateApiKey") {
      return rotateKey;
    }
    if (getFunctionName(mutation) === "projects:updateAllowedOrigins") {
      return updateAllowedOrigins;
    }
    return syncUser;
  },
}));

const { ProjectClient } = await import("./project-client");

beforeEach(() => {
  replace.mockClear();
  push.mockClear();
  deleteProject.mockClear();
  rotateKey.mockClear();
  updateAllowedOrigins.mockClear();
});

afterEach(cleanup);

async function openSettings() {
  render(<ProjectClient projectId={project._id} />);
  fireEvent.click(await screen.findByRole("button", { name: "Settings" }));
}

async function confirmDeletion() {
  await openSettings();
  fireEvent.click(screen.getByRole("button", { name: "Delete project" }));
  const confirmation = screen.getByRole("alertdialog");
  fireEvent.click(
    within(confirmation).getByRole("button", { name: "Delete project" }),
  );
}

test("failed deletion stays on the project and displays a retryable error", async () => {
  let rejectDeletion!: (error: Error) => void;
  deleteResult = new Promise((_, reject) => {
    rejectDeletion = reject;
  });

  await confirmDeletion();
  expect(deleteProject).toHaveBeenCalledTimes(1);
  expect(replace).not.toHaveBeenCalled();

  await act(async () => rejectDeletion(new Error("request failed")));
  expect(
    await screen.findByText(
      "Could not delete the project. No data was deleted; try again.",
    ),
  ).toBeDefined();
  expect(
    (
      screen.getByRole("button", {
        name: "Delete project",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
  expect(replace).not.toHaveBeenCalled();
});

test("successful deletion navigates only after the request completes", async () => {
  let resolveDeletion!: (value: unknown) => void;
  deleteResult = new Promise((resolve) => {
    resolveDeletion = resolve;
  });

  await confirmDeletion();
  expect(replace).not.toHaveBeenCalled();
  expect(screen.getByRole("status").textContent).toBe("Deleting project…");

  await act(async () => resolveDeletion({ ok: true }));
  expect(replace).toHaveBeenCalledTimes(1);
  expect(replace).toHaveBeenCalledWith("/dashboard");
});

test("failed origin save preserves the draft and keeps its retry available", async () => {
  await openSettings();
  const input = screen.getByRole("textbox", {
    name: "Allowed origins",
  }) as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: "https://draft.example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Save origins" }));

  expect(
    await screen.findByText(
      "Could not save allowed origins. Your edits are still here; check each URL and try again.",
    ),
  ).toBeDefined();
  expect(input.value).toBe("https://draft.example.com");
  expect(
    (screen.getByRole("button", { name: "Save origins" }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
  expect(updateAllowedOrigins).toHaveBeenCalledWith({
    projectId: project._id,
    allowedOrigins: ["https://draft.example.com"],
  });
});

test("closing dirty settings asks before discarding the draft", async () => {
  await openSettings();
  const input = screen.getByRole("textbox", {
    name: "Allowed origins",
  }) as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: "https://draft.example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Close" }));

  expect(screen.getByRole("alertdialog")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
  expect(input.value).toBe("https://draft.example.com");

  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Settings" }));
  expect(
    (
      screen.getByRole("textbox", {
        name: "Allowed origins",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("");
});

test("failed key rotation explains that the current key remains active", async () => {
  await openSettings();
  fireEvent.click(screen.getByRole("button", { name: "Rotate" }));
  fireEvent.click(screen.getByRole("button", { name: "Rotate key" }));

  expect(
    await screen.findByText(
      "Could not rotate the publishable key. The current key is still active; try again.",
    ),
  ).toBeDefined();
  expect(rotateKey).toHaveBeenCalledTimes(1);
  expect(
    (
      screen.getByRole("button", {
        name: "Rotate",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(false);
});
