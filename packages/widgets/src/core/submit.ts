import type { WidgetPayload } from "../types";

// Endpoint is hardcoded at build time. Developers never touch this.
const ENDPOINT = "https://coordinated-perch-697.convex.site/feedback";

export async function submitFeedback(payload: WidgetPayload) {
  const res = await fetch(ENDPOINT, {
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

