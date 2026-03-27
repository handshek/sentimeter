import type { WidgetPayload } from "../types";

const DEFAULT_ENDPOINT = "https://coordinated-perch-697.convex.site/feedback";

export async function submitFeedback(
  payload: WidgetPayload,
  endpoint = DEFAULT_ENDPOINT,
) {
  if (!payload.apiKey) return;

  const res = await fetch(endpoint, {
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
