import { afterEach, beforeEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { getFunctionName, type FunctionReturnType } from "convex/server";
import { useContext } from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { NavigationGuardProvider } from "nextjs-nav-guard";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const longName =
  "PolishVerificationProjectWithAnIntentionallyLongUnbrokenNameToExerciseWrappingAcrossNarrowDashboardContainers";
const fixtureTime = Date.UTC(2026, 9, 1);
const dayMs = 24 * 60 * 60 * 1000;
const projectId = "project-layout-fixture" as Id<"projects">;
const project = {
  _id: projectId,
  _creationTime: fixtureTime - 7 * dayMs,
  userId: "user-layout-fixture" as Id<"users">,
  name: longName,
  createdAt: fixtureTime - 7 * dayMs,
  allowedOrigins: [],
};
type FixtureState = "loading" | "empty" | "populated";
let fixtureState: FixtureState = "empty";
const syncUser = async () => {};
const router = {
  replace: mock(() => {}),
  push: mock(() => {}),
  back: mock(() => {}),
  forward: mock(() => {}),
  refresh: mock(() => {}),
  prefetch: mock(async () => {}),
};
const searchParams = new URLSearchParams();
const location = "/layout-verification/" + "long-location-".repeat(12);
const feedback: FunctionReturnType<typeof api.feedback.getFeedback> = [
  { widgetType: "emoji", value: 5 },
  { widgetType: "thumbs", value: 1 },
  { widgetType: "star", value: 4 },
].map((reaction, index) => ({
  ...reaction,
  widgetType: reaction.widgetType as "emoji" | "thumbs" | "star",
  _id: `feedback-layout-${index}` as Id<"feedback">,
  _creationTime: fixtureTime - 3600000,
  projectId,
  createdAt: fixtureTime - 3600000,
  location,
  text: "Local visual fixture response; no network submission.",
}));

mock.module("next/navigation", () => ({
  useRouter: () => useContext(AppRouterContext)!,
  usePathname: () => `/dashboard/projects/${projectId}`,
  useParams: () => ({ projectId }),
  useSearchParams: () => searchParams,
}));

mock.module("convex/react", () => ({
  useConvexAuth: () => ({ isLoading: false, isAuthenticated: true }),
  useMutation: () => syncUser,
  useQuery: (query: Parameters<typeof getFunctionName>[0], args: unknown) => {
    if (args === "skip" || fixtureState === "loading") return undefined;
    const total = fixtureState === "populated" ? feedback.length : 0;
    switch (getFunctionName(query)) {
      case "projects:getProject":
        return { project, activeApiKey: { key: "pk_local_layout_fixture" } };
      case "projects:getProjects":
        return fixtureState === "populated" ? [project] : [];
      case "feedback:getFeedback":
        return fixtureState === "populated" ? feedback : [];
      case "feedback:getAnalytics":
        return {
          total,
          byValue: total ? { "1": 1, "4": 1, "5": 1 } : {},
          byLocation: total ? { [location]: { total, byValue: {} } } : {},
          byWidgetType: {
            emoji: total ? 1 : 0,
            thumbs: total ? 1 : 0,
            star: total ? 1 : 0,
          },
          byWidgetTypeByValue: { emoji: {}, thumbs: {}, star: {} },
          range: "7d",
          widgetType: null,
        } satisfies FunctionReturnType<typeof api.feedback.getAnalytics>;
      case "feedback:getVolumeSeries":
        return {
          requestedRange: "7d",
          effectiveRange: "7d",
          widgetType: null,
          granularity: "day",
          from: fixtureTime - 7 * dayMs,
          to: fixtureTime,
          points: Array.from({ length: 7 }, (_, index) => ({
            ts: fixtureTime - (7 - index) * dayMs,
            total: index === 6 ? total : 0,
            positive: index === 6 ? total : 0,
            negative: 0,
          })),
        } satisfies FunctionReturnType<typeof api.feedback.getVolumeSeries>;
      default:
        return undefined;
    }
  },
}));

const { ProjectClient } = await import("./project-client");
const { ProjectsClient } = await import("./projects-client");

beforeEach(() => {
  fixtureState = "empty";
  window.history.replaceState(null, "", `/dashboard/projects/${projectId}`);
});
afterEach(cleanup);

function renderClient(client: React.ReactNode) {
  return render(
    <AppRouterContext.Provider value={router}>
      <NavigationGuardProvider>{client}</NavigationGuardProvider>
    </AppRouterContext.Provider>,
  );
}

// Optional artifacts use actual rendered components with synthetic data, never
// copies of private dashboard markup or hand-maintained versions of the UI.
async function writeVisualFixture(name: string) {
  const directory = process.env.SENTIMETER_POLISH_FIXTURES_DIR;
  if (!directory) return;
  await Bun.write(`${directory}/${name}.html`, document.body.innerHTML);
}

for (const state of ["loading", "empty", "populated"] as const) {
  test(`dashboard ${state} fixture renders the expected data state`, async () => {
    fixtureState = state;
    renderClient(<ProjectClient projectId={projectId} />);
    if (state === "loading") {
      expect(
        await screen.findByText("Loading project dashboard data."),
      ).toBeDefined();
    } else {
      expect(
        await screen.findByRole("heading", { name: longName }),
      ).toBeDefined();
      const count = state === "populated" ? 3 : 0;
      expect(
        await screen.findByText(`Showing all ${count} responses`),
      ).toBeDefined();
    }
    await writeVisualFixture(`dashboard-${state}`);
  });

  test(`projects ${state} fixture renders the expected data state`, async () => {
    fixtureState = state;
    renderClient(<ProjectsClient />);
    if (state === "populated") {
      expect(await screen.findByText(longName)).toBeDefined();
      expect(
        screen.getByRole("link", { name: "Open" }).getAttribute("href"),
      ).toBe(`/dashboard/projects/${projectId}`);
    } else if (state === "empty") {
      expect(
        await screen.findByText("Create your first project"),
      ).toBeDefined();
    } else {
      expect(await screen.findByText("Loading projects…")).toBeDefined();
    }
    await writeVisualFixture(`projects-${state}`);
  });
}

test("settings expose the full long project name through the dialog description", async () => {
  fixtureState = "populated";
  renderClient(<ProjectClient projectId={projectId} />);
  fireEvent.click(await screen.findByRole("button", { name: "Settings" }));
  const dialog = screen.getByRole("dialog", { name: "Project settings" });
  const descriptionId = dialog.getAttribute("aria-describedby")!;
  expect(document.getElementById(descriptionId)?.textContent).toBe(longName);
  await writeVisualFixture("settings-long");
});
