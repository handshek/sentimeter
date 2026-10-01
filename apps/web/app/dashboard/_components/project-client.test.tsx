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
import { useContext } from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { NavigationGuardProvider } from "nextjs-nav-guard";

const replace = mock(() => {});
const push = mock(() => {});
const router = {
  replace,
  push,
  back: mock(() => {}),
  forward: mock(() => {}),
  refresh: mock(() => {}),
  prefetch: mock(async () => {}),
};
const originalConfirm = window.confirm;
const confirmNavigation = mock(() => false);
const searchParams = new URLSearchParams();
let deleteResult: Promise<unknown>;
const deleteProject = mock(() => deleteResult);
const syncUser = async () => {};
const rotateKey = mock(async () => {
  throw new Error("request failed");
});
let originSaveResult: Promise<{ allowedOrigins: string[] }> | undefined;
const updateAllowedOrigins = mock(async () => {
  if (originSaveResult) return originSaveResult;
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
  useRouter: () => useContext(AppRouterContext)!,
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
  originSaveResult = undefined;
  confirmNavigation.mockReset();
  confirmNavigation.mockReturnValue(false);
  window.confirm = confirmNavigation;
  window.history.replaceState(null, "", "/dashboard/projects/project-test");
});

afterEach(() => {
  cleanup();
  window.confirm = originalConfirm;
});

async function openSettings() {
  render(
    <AppRouterContext.Provider value={router}>
      <NavigationGuardProvider>
        <ProjectClient projectId={project._id} />
      </NavigationGuardProvider>
    </AppRouterContext.Provider>,
  );
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

test("a successful save announces the normalized origins and clears the dirty state", async () => {
  originSaveResult = Promise.resolve({
    allowedOrigins: ["https://app.example.com"],
  });
  await openSettings();
  const input = screen.getByRole("textbox", {
    name: "Allowed origins",
  }) as HTMLTextAreaElement;
  fireEvent.change(input, {
    target: { value: "https://app.example.com/" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save origins" }));

  expect(await screen.findByText("Allowed origins saved.")).toBeDefined();
  expect(input.value).toBe("https://app.example.com");
  expect(
    (screen.getByRole("button", { name: "Saved" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByRole("alertdialog")).toBeNull();
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

test("a canceled project link keeps unsaved origins on the current project", async () => {
  await openSettings();
  const input = screen.getByRole("textbox", {
    name: "Allowed origins",
  }) as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: "https://draft.example.com" } });

  await act(async () => {
    fireEvent.click(document.querySelector('a[href="/dashboard"]')!);
  });

  expect(confirmNavigation).toHaveBeenCalledTimes(1);
  expect(push).not.toHaveBeenCalled();
  expect(input.value).toBe("https://draft.example.com");
});

test("confirming departure allows the project link through", async () => {
  await openSettings();
  fireEvent.change(screen.getByRole("textbox", { name: "Allowed origins" }), {
    target: { value: "https://draft.example.com" },
  });
  confirmNavigation.mockReturnValue(true);

  await act(async () => {
    fireEvent.click(document.querySelector('a[href="/dashboard"]')!);
  });

  expect(confirmNavigation).toHaveBeenCalledTimes(1);
  expect(push).toHaveBeenCalledWith("http://localhost:3000/dashboard");
});

test("same-project links do not warn because they preserve the origin draft", async () => {
  await openSettings();
  const input = screen.getByRole("textbox", {
    name: "Allowed origins",
  }) as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: "https://draft.example.com" } });
  const link = document.createElement("a");
  link.href = "/dashboard/projects/project-test?range=all";
  document.body.append(link);

  await act(async () => fireEvent.click(link));
  link.remove();

  expect(confirmNavigation).not.toHaveBeenCalled();
  expect(input.value).toBe("https://draft.example.com");
});

test("page unload is guarded only while the origin draft is dirty", async () => {
  await openSettings();
  const cleanUnload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(cleanUnload);
  expect(cleanUnload.defaultPrevented).toBe(false);

  fireEvent.change(screen.getByRole("textbox", { name: "Allowed origins" }), {
    target: { value: "https://draft.example.com" },
  });
  const dirtyUnload = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(dirtyUnload);
  expect(dirtyUnload.defaultPrevented).toBe(true);
});
