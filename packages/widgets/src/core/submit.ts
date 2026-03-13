import type { WidgetPayload } from "../types";

// Endpoint is hardcoded at build time. Developers never touch this.
const ENDPOINT = "https://[your-deployment].convex.site/feedback";

export async function submitFeedback(payload: WidgetPayload) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("failed");
}

