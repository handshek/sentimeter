import {
  WidgetSubmitError,
  type WidgetPayload,
  type WidgetState,
} from "@repo/widgets";

export async function submitToConvexSite(
  payload: WidgetPayload,
  apiKey: string,
): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL?.trim();
  if (!siteUrl) {
    throw new Error(
      "Set NEXT_PUBLIC_CONVEX_SITE_URL to test hosted submission.",
    );
  }
  const normalizedApiKey = apiKey.trim();
  if (!normalizedApiKey) {
    throw new Error("Choose a project key to test hosted submission.");
  }

  let response: Response;
  try {
    response = await fetch(`${siteUrl.replace(/\/+$/, "")}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, apiKey: normalizedApiKey }),
    });
  } catch (cause) {
    throw new WidgetSubmitError(
      "network_error",
      "Check your connection and try again.",
      { cause },
    );
  }
  if (response.ok) return;

  let retryAfterMs: number | undefined;
  try {
    const body: unknown = await response.json();
    if (
      body !== null &&
      typeof body === "object" &&
      "retryAfter" in body &&
      typeof body.retryAfter === "number" &&
      Number.isFinite(body.retryAfter) &&
      body.retryAfter >= 0
    ) {
      retryAfterMs = body.retryAfter;
    }
  } catch {
    // HTTP status still identifies the failure if its body is not JSON.
  }
  throw new WidgetSubmitError(
    response.status === 429 ? "rate_limited" : "unknown",
    response.status === 429
      ? "Too many responses. Please try again soon."
      : `Hosted test failed (HTTP ${response.status}). Check the project key and allowed origins.`,
    { status: response.status, retryAfterMs },
  );
}

export type SubmitResult = {
  ok: boolean;
  status: number;
  error?: string;
  at: number;
};

export type WidgetRigState = {
  state: WidgetState;
  selectedValue: number | null;
  lastPayload: WidgetPayload | null;
  lastResult: SubmitResult | null;
  instance: number;
};

export type WidgetRigAction =
  | { type: "reset-widget" }
  | { type: "clear-debug" }
  | { type: "state-changed"; instance: number; state: WidgetState }
  | { type: "selected"; instance: number; value: number }
  | { type: "submit-start"; instance: number; payload: WidgetPayload }
  | { type: "submit-result"; instance: number; result: SubmitResult };

export function createWidgetRigState(instance = 0): WidgetRigState {
  return {
    state: "idle",
    selectedValue: null,
    lastPayload: null,
    lastResult: null,
    instance,
  };
}

export function widgetRigReducer(
  state: WidgetRigState,
  action: WidgetRigAction,
): WidgetRigState {
  if (action.type === "reset-widget" || action.type === "clear-debug") {
    return createWidgetRigState(state.instance + 1);
  }

  if (action.instance !== state.instance) return state;

  switch (action.type) {
    case "state-changed":
      return action.state === "idle"
        ? createWidgetRigState(state.instance)
        : { ...state, state: action.state };
    case "selected":
      return {
        ...state,
        selectedValue: action.value,
        lastPayload: null,
        lastResult: null,
      };
    case "submit-start":
      return { ...state, lastPayload: action.payload };
    case "submit-result":
      return { ...state, lastResult: action.result };
  }
}

export function getProjectDashboardHref(projectId: string) {
  const normalizedProjectId = projectId.trim();
  return normalizedProjectId
    ? `/dashboard/projects/${encodeURIComponent(normalizedProjectId)}`
    : null;
}
