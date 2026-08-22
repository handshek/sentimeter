import {
  WidgetSubmitError,
  type WidgetPayload,
  type WidgetSubmitErrorCode,
} from "../types";

/** Sentimeter production HTTP action URL (override via `endpoint` prop for staging/self-host). */
export const DEFAULT_FEEDBACK_ENDPOINT =
  "https://coordinated-perch-697.convex.site/feedback";

const ERROR_MESSAGES: Record<WidgetSubmitErrorCode, string> = {
  missing_api_key: "Add an API key before sending feedback.",
  invalid_key: "This feedback widget is not configured correctly.",
  origin_not_allowed: "This feedback widget is not available here.",
  rate_limited: "Too many responses. Please try again soon.",
  invalid_value: "Choose a valid rating and try again.",
  invalid_body: "We couldn't send your feedback. Try again.",
  network_error: "Check your connection and try again.",
  unknown: "We couldn't send your feedback. Try again.",
};

const SERVER_ERROR_CODES = new Set<WidgetSubmitErrorCode>([
  "invalid_key",
  "origin_not_allowed",
  "rate_limited",
  "invalid_value",
  "invalid_body",
]);

export function normalizeSubmitError(error: unknown): WidgetSubmitError {
  if (error instanceof WidgetSubmitError) return error;
  return new WidgetSubmitError("unknown", ERROR_MESSAGES.unknown, {
    cause: error,
  });
}

export async function submitFeedback(
  payload: WidgetPayload,
  endpoint: string = DEFAULT_FEEDBACK_ENDPOINT,
) {
  if (!payload.apiKey.trim()) {
    throw new WidgetSubmitError(
      "missing_api_key",
      ERROR_MESSAGES.missing_api_key,
    );
  }

  const url = endpoint.trim() || DEFAULT_FEEDBACK_ENDPOINT;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (cause) {
    throw new WidgetSubmitError("network_error", ERROR_MESSAGES.network_error, {
      cause,
    });
  }

  if (res.ok) return;

  let code: WidgetSubmitErrorCode = "unknown";
  let retryAfterMs: number | undefined;
  try {
    const body = (await res.json()) as {
      code?: unknown;
      error?: unknown;
      retryAfter?: unknown;
    };
    const candidate =
      typeof body.code === "string"
        ? body.code
        : typeof body.error === "string"
          ? body.error
          : "unknown";
    if (SERVER_ERROR_CODES.has(candidate as WidgetSubmitErrorCode)) {
      code = candidate as WidgetSubmitErrorCode;
    }
    if (
      typeof body.retryAfter === "number" &&
      Number.isFinite(body.retryAfter) &&
      body.retryAfter >= 0
    ) {
      retryAfterMs = body.retryAfter;
    }
  } catch {
    // ignore
  }

  throw new WidgetSubmitError(code, ERROR_MESSAGES[code], {
    status: res.status,
    retryAfterMs,
  });
}
