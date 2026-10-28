export type AllowedOriginsDraft = {
  value: string;
  savedValue: string;
  initialized: boolean;
  error: string;
} & (
  | { status: "idle" | "saved" | "error" }
  | { status: "saving"; submittedValue: string; discarded: boolean }
);

export type AllowedOriginsDraftAction =
  | { type: "hydrate"; value: string }
  | { type: "edit"; value: string }
  | { type: "save-start" }
  | { type: "save-success"; value: string }
  | { type: "save-error"; message: string }
  | { type: "clear-status" }
  | { type: "discard" };

export function createAllowedOriginsDraft(): AllowedOriginsDraft {
  return {
    value: "",
    savedValue: "",
    initialized: false,
    status: "idle",
    error: "",
  };
}

export function hasUnsavedAllowedOrigins(state: AllowedOriginsDraft) {
  return state.initialized && state.value !== state.savedValue;
}

export function allowedOriginsDraftReducer(
  state: AllowedOriginsDraft,
  action: AllowedOriginsDraftAction,
): AllowedOriginsDraft {
  switch (action.type) {
    case "hydrate":
      if (state.status === "saving") {
        return {
          ...state,
          value: state.discarded ? action.value : state.value,
          savedValue: action.value,
        };
      }
      if (hasUnsavedAllowedOrigins(state)) {
        return { ...state, savedValue: action.value };
      }
      return {
        value: action.value,
        savedValue: action.value,
        initialized: true,
        status: "idle",
        error: "",
      };
    case "edit":
      if (state.status === "saving") {
        return { ...state, value: action.value, discarded: false, error: "" };
      }
      return {
        ...state,
        value: action.value,
        status: "idle",
        error: "",
      };
    case "save-start":
      if (state.status === "saving") return state;
      return {
        ...state,
        status: "saving",
        submittedValue: state.value,
        discarded: false,
        error: "",
      };
    case "save-success": {
      const keepDraft =
        state.status === "saving" &&
        !state.discarded &&
        state.value !== state.submittedValue;
      return {
        value: keepDraft ? state.value : action.value,
        savedValue: action.value,
        initialized: true,
        status: keepDraft ? "idle" : "saved",
        error: "",
      };
    }
    case "save-error":
      return { ...state, status: "error", error: action.message };
    case "clear-status":
      return state.status === "saved" ? { ...state, status: "idle" } : state;
    case "discard":
      if (state.status === "saving") {
        return {
          ...state,
          value: state.savedValue,
          discarded: true,
          error: "",
        };
      }
      return {
        ...state,
        value: state.savedValue,
        status: "idle",
        error: "",
      };
  }
}
