import type { WidgetPayload } from "../types";

/** Sentimeter production HTTP action URL (override via `endpoint` prop for staging/self-host). */
export const DEFAULT_FEEDBACK_ENDPOINT =
  "https://coordinated-perch-697.convex.site/feedback";

export async function submitFeedback(
  payload: WidgetPayload,
  endpoint: string = DEFAULT_FEEDBACK_ENDPOINT,
) {
  if (!payload.apiKey) return;

  const url = endpoint.trim() || DEFAULT_FEEDBACK_ENDPOINT;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) return;

  let error = "failed";
  try {
    const body = await res.json();
    if (typeof body?.error === "string") error = body.error;
  } catch {
    // ignore
  }

  throw new Error(error);
}
