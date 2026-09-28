import type { WidgetPayload, WidgetState } from "@repo/widgets";

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
