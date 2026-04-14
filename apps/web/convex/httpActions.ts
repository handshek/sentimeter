import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

function withCorsHeaders(
  origin: string | null,
  headers: HeadersInit = {},
) {
  return {
    ...(origin ? { "access-control-allow-origin": origin } : {}),
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
    ...headers,
  };
}

function json(
  status: number,
  body: unknown,
  options?: {
    origin?: string | null;
    headers?: HeadersInit;
  },
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: withCorsHeaders(options?.origin ?? "*", {
      "content-type": "application/json",
      ...options?.headers,
    }),
  });
}

type WidgetType = "emoji" | "thumbs" | "star";
type FeedbackBody = {
  apiKey?: unknown;
  widgetType?: unknown;
  value?: unknown;
  location?: unknown;
  text?: unknown;
};

function isWidgetType(value: unknown): value is WidgetType {
  return value === "emoji" || value === "thumbs" || value === "star";
}

export const feedbackOptions = httpAction(async (_ctx, request) => {
  return new Response(null, {
    status: 204,
    headers: withCorsHeaders(request.headers.get("origin") ?? "*"),
  });
});

export const feedbackPost = httpAction(async (ctx, request) => {
  let body: FeedbackBody;
  try {
    body = (await request.json()) as FeedbackBody;
  } catch {
    return json(400, { error: "invalid_body", code: "invalid_body" });
  }

  const apiKey = typeof body?.apiKey === "string" ? body.apiKey : undefined;
  const widgetType = body?.widgetType;
  const value = body?.value;
  const location =
    typeof body?.location === "string" ? body.location : undefined;
  const rawText = typeof body?.text === "string" ? body.text.trim() : undefined;
  const text = rawText && rawText.length > 0 ? rawText.slice(0, 500) : undefined;
  const origin = request.headers.get("origin") || undefined;

  if (
    !apiKey ||
    !location ||
    !isWidgetType(widgetType) ||
    typeof value !== "number"
  ) {
    return json(400, { error: "invalid_body", code: "invalid_body" });
  }

  const result = await ctx.runMutation(
    internal.feedback.submitFeedbackInternal,
    {
      apiKey,
      widgetType,
      value,
      location,
      text,
      origin,
    },
  );

  if (!result.ok) {
    const originHeader = "corsOrigin" in result ? result.corsOrigin : "*";
    if (result.error === "invalid_key")
      return json(401, { error: "invalid_key", code: "invalid_key" }, { origin: originHeader });
    if (result.error === "origin_not_allowed")
      return json(
        403,
        { error: "origin_not_allowed", code: "origin_not_allowed" },
        { origin: originHeader },
      );
    if (result.error === "rate_limited")
      return json(
        429,
        {
          error: "rate_limited",
          code: "rate_limited",
          retryAfter: result.retryAfter,
        },
        {
          origin: originHeader,
          headers: {
            "retry-after": String(
              Math.max(1, Math.ceil((result.retryAfter ?? 1000) / 1000)),
            ),
          },
        },
      );
    if (result.error === "invalid_value")
      return json(400, { error: "invalid_value", code: "invalid_value" }, { origin: originHeader });
    return json(400, { error: "invalid_body", code: "invalid_body" }, { origin: originHeader });
  }

  return json(200, { ok: true }, { origin: result.corsOrigin });
});
