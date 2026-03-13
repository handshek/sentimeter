import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

function withCorsHeaders(headers: HeadersInit = {}) {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    ...headers,
  };
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: withCorsHeaders({ "content-type": "application/json" }),
  });
}

type WidgetType = "emoji" | "thumbs" | "star";

function isWidgetType(value: unknown): value is WidgetType {
  return value === "emoji" || value === "thumbs" || value === "star";
}

export const feedbackOptions = httpAction(async () => {
  return new Response(null, { status: 204, headers: withCorsHeaders() });
});

export const feedbackPost = httpAction(async (ctx, request) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: "invalid_body" });
  }

  const apiKey = typeof body?.apiKey === "string" ? body.apiKey : undefined;
  const widgetType = body?.widgetType;
  const value = body?.value;
  const location =
    typeof body?.location === "string" ? body.location : undefined;

  if (
    !apiKey ||
    !location ||
    !isWidgetType(widgetType) ||
    typeof value !== "number"
  ) {
    return json(400, { error: "invalid_body" });
  }

  const result = await ctx.runMutation(
    internal.feedback.submitFeedbackInternal,
    {
      apiKey,
      widgetType,
      value,
      location,
    },
  );

  if (!result.ok) {
    if (result.error === "invalid_key")
      return json(401, { error: "invalid_key" });
    if (result.error === "invalid_value")
      return json(400, { error: "invalid_value" });
    return json(400, { error: "invalid_body" });
  }

  return json(200, { ok: true });
});
