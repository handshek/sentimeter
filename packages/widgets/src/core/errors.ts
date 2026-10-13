import { WidgetSubmitError } from "../types";

export function normalizeSubmitError(error: unknown): WidgetSubmitError {
  if (error instanceof WidgetSubmitError) return error;
  return new WidgetSubmitError(
    "unknown",
    "We couldn't send your feedback. Try again.",
    { cause: error },
  );
}
