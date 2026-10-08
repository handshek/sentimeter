import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { getFunctionName, type FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";
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
let analyticsResult:
  | FunctionReturnType<typeof api.feedback.getAnalytics>
  | undefined;
let volumeResult:
  | FunctionReturnType<typeof api.feedback.getVolumeSeries>
  | undefined;
let feedbackResult:
  | FunctionReturnType<typeof api.feedback.getFeedback>
  | undefined;
const queryCalls = mock((name: string, args: unknown) => ({ name, args }));
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
    queryCalls(getFunctionName(query), args);
    if (args === "skip") return undefined;
    if (getFunctionName(query) === "projects:getProject") {
      return { project, activeApiKey: { key: "pk_test_fixture" } };
    }
    if (getFunctionName(query) === "feedback:getAnalytics")
      return analyticsResult;
    if (getFunctionName(query) === "feedback:getVolumeSeries")
      return volumeResult;
    if (getFunctionName(query) === "feedback:getFeedback")
      return feedbackResult;
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
  analyticsResult = undefined;
  volumeResult = undefined;
  feedbackResult = undefined;
  queryCalls.mockClear();
  for (const key of Array.from(searchParams.keys())) searchParams.delete(key);
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

function setAnalyticsFixture({
  range = "all",
  widgetType,
  counts,
  points = [{ ts: Date.UTC(2026, 9, 8), total: 1, positive: 1, negative: 0 }],
}: {
  range?: "24h" | "7d" | "30d" | "all";
  widgetType?: "emoji" | "thumbs" | "star";
  counts: Record<"emoji" | "thumbs" | "star", Record<string, number>>;
  points?: NonNullable<typeof volumeResult>["points"];
}) {
  searchParams.set("range", range);
  if (widgetType) searchParams.set("widget", widgetType);
  const byWidgetType = {
    emoji: Object.values(counts.emoji).reduce((sum, count) => sum + count, 0),
    thumbs: Object.values(counts.thumbs).reduce((sum, count) => sum + count, 0),
    star: Object.values(counts.star).reduce((sum, count) => sum + count, 0),
  };
  const byValue: Record<string, number> = {};
  for (const widgetCounts of Object.values(counts)) {
    for (const [value, count] of Object.entries(widgetCounts)) {
      byValue[value] = (byValue[value] ?? 0) + count;
    }
  }
  analyticsResult = {
    total: Object.values(byWidgetType).reduce((sum, count) => sum + count, 0),
    byValue,
    topLocations: [],
    byWidgetType,
    byWidgetTypeByValue: counts,
    range,
    widgetType: widgetType ?? null,
  };
  volumeResult = {
    requestedRange: range,
    effectiveRange: range === "all" ? "30d" : range,
    widgetType: widgetType ?? null,
    granularity: range === "24h" ? "hour" : "day",
    from: Date.UTC(2026, 8, 9),
    to: Date.UTC(2026, 9, 9),
    points,
  };
  feedbackResult = [];
}

function renderProject() {
  return render(
    <AppRouterContext.Provider value={router}>
      <NavigationGuardProvider>
        <ProjectClient projectId={project._id} />
      </NavigationGuardProvider>
    </AppRouterContext.Provider>,
  );
}

async function renderAnalytics() {
  renderProject();
  await screen.findByText(
    "Project dashboard data loaded. Live updates are connected.",
  );
}

function kpiCard(label: string) {
  return screen
    .getAllByText(label, { selector: "span.text-sm.font-medium" })[0]!
    .closest<HTMLElement>('[data-slot="card"]')!;
}

test("all-time sentiment includes older feedback across widget types while volume stays bounded", async () => {
  // All-time aggregates include old negative/neutral rows; only one recent
  // positive response remains in the intentionally capped volume series.
  setAnalyticsFixture({
    counts: {
      emoji: { "1": 1, "3": 1, "5": 1 },
      thumbs: { "0": 1, "1": 1 },
      star: { "1": 1, "3": 1, "5": 1 },
    },
  });
  await renderAnalytics();

  expect(within(kpiCard("Total responses")).getByText("8")).toBeDefined();
  expect(within(kpiCard("Sentiment")).getByText("50%")).toBeDefined();
  expect(kpiCard("Sentiment").textContent).toContain("3 positive of 6");
  expect(within(kpiCard("Negative")).getByText("3")).toBeDefined();
  expect(kpiCard("Negative").textContent).toContain("38% of responses");
  const distribution = screen
    .getByText("Distribution across all widgets")
    .closest<HTMLElement>('[data-slot="card"]')!;
  expect(within(distribution).getByText("8")).toBeDefined();
  expect(within(distribution).getByText("25%")).toBeDefined();
  const chart = screen
    .getByText("Response volume")
    .closest<HTMLElement>('[data-slot="card"]')!;
  expect(within(chart).getByText("LAST 30 DAYS")).toBeDefined();
  expect(chart.textContent).toContain(
    "Response volume for the last 30 days: 1 total responses",
  );
  expect(chart.textContent).not.toContain("Response volume for all time");
});

for (const widgetType of ["emoji", "thumbs", "star"] as const) {
  test(`all-time ${widgetType} filter uses its full aggregate and widget-specific sentiment`, async () => {
    setAnalyticsFixture({
      widgetType,
      counts: {
        emoji: {},
        thumbs: {},
        star: {},
        [widgetType]:
          widgetType === "thumbs"
            ? { "0": 1, "1": 1 }
            : { "1": 1, "3": 1, "5": 1 },
      },
    });
    await renderAnalytics();

    expect(within(kpiCard("Sentiment")).getByText("50%")).toBeDefined();
    expect(kpiCard("Sentiment").textContent).toContain("1 positive of 2");
    expect(within(kpiCard("Negative")).getByText("1")).toBeDefined();
    expect(kpiCard("Negative").textContent).toContain(
      widgetType === "thumbs" ? "50% of responses" : "33% of responses",
    );
    expect(queryCalls).toHaveBeenCalledWith("feedback:getAnalytics", {
      projectId: project._id,
      range: "all",
      widgetType,
    });
    expect(queryCalls).toHaveBeenCalledWith("feedback:getVolumeSeries", {
      projectId: project._id,
      range: "all",
      widgetType,
    });
  });
}

for (const range of ["24h", "7d", "30d"] as const) {
  test(`${range} sentiment and volume retain the selected range`, async () => {
    setAnalyticsFixture({
      range,
      counts: { emoji: {}, thumbs: { "0": 2, "1": 1 }, star: {} },
      points: [
        { ts: Date.UTC(2026, 9, 8), total: 3, positive: 1, negative: 2 },
      ],
    });
    await renderAnalytics();

    expect(within(kpiCard("Sentiment")).getByText("33%")).toBeDefined();
    expect(within(kpiCard("Negative")).getByText("2")).toBeDefined();
    expect(queryCalls).toHaveBeenCalledWith("feedback:getAnalytics", {
      projectId: project._id,
      range,
      widgetType: undefined,
    });
    const chart = screen
      .getByText("Response volume")
      .closest<HTMLElement>('[data-slot="card"]')!;
    const label =
      range === "24h"
        ? "LAST 24 HOURS"
        : range === "7d"
          ? "LAST 7 DAYS"
          : "LAST 30 DAYS";
    expect(within(chart).getByText(label)).toBeDefined();
    expect(chart.textContent).toContain("3 total responses");
  });
}

test("neutral-only all-time feedback remains in the distribution without changing scored sentiment", async () => {
  setAnalyticsFixture({
    counts: { emoji: { "3": 2 }, thumbs: {}, star: {} },
    points: [],
  });
  await renderAnalytics();

  expect(within(kpiCard("Total responses")).getByText("2")).toBeDefined();
  expect(within(kpiCard("Sentiment")).getByText("0%")).toBeDefined();
  expect(kpiCard("Sentiment").textContent).toContain("0 positive of 0");
  expect(within(kpiCard("Negative")).getByText("0")).toBeDefined();
  const distribution = screen
    .getByText("Distribution across all widgets")
    .closest<HTMLElement>('[data-slot="card"]')!;
  expect(within(distribution).getByText("100%")).toBeDefined();
});

test("empty all-time analytics has zero sentiment and a bounded empty chart", async () => {
  setAnalyticsFixture({
    counts: { emoji: {}, thumbs: {}, star: {} },
    points: [],
  });
  await renderAnalytics();

  expect(within(kpiCard("Total responses")).getByText("0")).toBeDefined();
  expect(within(kpiCard("Sentiment")).getByText("0%")).toBeDefined();
  expect(within(kpiCard("Negative")).getByText("0")).toBeDefined();
  expect(kpiCard("Negative").textContent).toContain("none in range");
  expect(
    screen.getByText("Response volume for the last 30 days: no responses."),
  ).toBeDefined();
});

test("sentiment distribution waits for analytics even after volume resolves", async () => {
  setAnalyticsFixture({
    counts: { emoji: {}, thumbs: {}, star: { "1": 1, "3": 1, "5": 1 } },
  });
  analyticsResult = undefined;
  renderProject();

  const distribution = (
    await screen.findByText("Distribution across all widgets")
  ).closest<HTMLElement>('[data-slot="card"]')!;
  expect(
    within(distribution).queryByText("responses")?.textContent,
  ).toBeUndefined();
  expect(within(distribution).queryByText("Positive")).toBeNull();
  expect(within(distribution).queryByText("Neutral")).toBeNull();
  expect(within(distribution).queryByText("Negative")).toBeNull();
  expect(
    distribution.querySelector('.animate-pulse[aria-hidden="true"]'),
  ).not.toBeNull();
  const chart = screen
    .getByText("Response volume")
    .closest<HTMLElement>('[data-slot="card"]')!;
  expect(chart.textContent).toContain(
    "Response volume for the last 30 days: 1 total responses",
  );
  expect(within(chart).queryByText("Loading response volume.")).toBeNull();
});

test("sentiment distribution renders analytics while volume is still loading", async () => {
  setAnalyticsFixture({
    counts: { emoji: {}, thumbs: {}, star: { "1": 1, "3": 1, "5": 1 } },
  });
  volumeResult = undefined;
  renderProject();

  const distribution = (
    await screen.findByText("Distribution across all widgets")
  ).closest<HTMLElement>('[data-slot="card"]')!;
  expect(within(distribution).getByText("3")).toBeDefined();
  expect(within(distribution).getByText("responses")).toBeDefined();
  expect(within(distribution).getByText("Positive")).toBeDefined();
  expect(within(distribution).getByText("Neutral")).toBeDefined();
  expect(within(distribution).getByText("Negative")).toBeDefined();
  expect(within(distribution).getAllByText("1")).toHaveLength(3);
  expect(within(distribution).getAllByText("33%")).toHaveLength(3);
  expect(
    distribution.querySelector('.animate-pulse[aria-hidden="true"]'),
  ).toBeNull();
  const chart = screen
    .getByText("Response volume")
    .closest<HTMLElement>('[data-slot="card"]')!;
  expect(within(chart).getByText("Loading response volume.")).toBeDefined();
  expect(
    within(chart).queryByText("Response volume by time period"),
  ).toBeNull();
});
