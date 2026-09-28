export type AllowedOriginsDraft = {
  value: string;
  savedValue: string;
  initialized: boolean;
  status: "idle" | "saving" | "saved" | "error";
  error: string;
};

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
      return {
        ...state,
        value: action.value,
        status: "idle",
        error: "",
      };
    case "save-start":
      return { ...state, status: "saving", error: "" };
    case "save-success":
      return {
        value: action.value,
        savedValue: action.value,
        initialized: true,
        status: "saved",
        error: "",
      };
    case "save-error":
      return { ...state, status: "error", error: action.message };
    case "clear-status":
      return state.status === "saved" ? { ...state, status: "idle" } : state;
    case "discard":
      return {
        ...state,
        value: state.savedValue,
        status: "idle",
        error: "",
      };
  }
}
