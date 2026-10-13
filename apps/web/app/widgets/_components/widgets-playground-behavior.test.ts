import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { copyText } from "../../_lib/clipboard";
import { WidgetSubmitError } from "@repo/widgets";
import {
  createWidgetRigState,
  getProjectDashboardHref,
  submitToConvexSite,
  widgetRigReducer,
} from "./widgets-playground-behavior";

describe("widgets playground behavior", () => {
  const dirtyRigState = {
    ...createWidgetRigState(),
    state: "selected" as const,
    selectedValue: 5,
    lastPayload: {
      location: "/pricing",
      widgetType: "star" as const,
      value: 5,
    },
    lastResult: { ok: true, status: 200, at: 123 },
    instance: 3,
  };

  test("reset widget remounts the widget and clears its diagnostics", () => {
    assert.deepEqual(
      widgetRigReducer(dirtyRigState, { type: "reset-widget" }),
      createWidgetRigState(4),
    );
  });

  test("clear debug also resets the visible widget so state cannot disagree", () => {
    assert.deepEqual(
      widgetRigReducer(dirtyRigState, { type: "clear-debug" }),
      createWidgetRigState(4),
    );
  });

  test("ignores a late result from a widget that was already reset", () => {
    const resetState = createWidgetRigState(4);

    assert.equal(
      widgetRigReducer(resetState, {
        type: "submit-result",
        instance: 3,
        result: { ok: false, status: 0, error: "late", at: 456 },
      }),
      resetState,
    );
  });

  test("copies a project key and returns an announced success state", async () => {
    let copiedValue = "";

    const result = await copyText("pk_project", {
      writeText: async (value) => {
        copiedValue = value;
      },
    });

    assert.equal(result, "copied");
    assert.equal(copiedValue, "pk_project");
  });

  test("returns an inline manual-copy state when clipboard access fails", async () => {
    const result = await copyText("pk_project", {
      writeText: async () => {
        throw new Error("clipboard unavailable");
      },
    });

    assert.equal(result, "manual");
  });

  test("does not create dashboard navigation without a selected project", () => {
    assert.equal(getProjectDashboardHref(""), null);
    assert.equal(getProjectDashboardHref("   "), null);
    assert.equal(
      getProjectDashboardHref("project-123"),
      "/dashboard/projects/project-123",
    );
  });
});

describe("dev playground hosted submission", () => {
  const originalFetch = globalThis.fetch;
  const originalSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const payload = {
    location: "/pricing",
    widgetType: "star",
    value: 5,
  } as const;

  function replaceFetch(
    implementation: (
      ...args: Parameters<typeof fetch>
    ) => ReturnType<typeof fetch>,
  ) {
    globalThis.fetch = Object.assign(implementation, {
      preconnect: originalFetch.preconnect,
    });
  }

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalSiteUrl === undefined)
      delete process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
    else process.env.NEXT_PUBLIC_CONVEX_SITE_URL = originalSiteUrl;
  });

  test("posts the project key with the public widget payload to the configured site", async () => {
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL = " https://example.test/// ";
    let request: { url: unknown; options?: RequestInit } | undefined;
    replaceFetch(async (url, options) => {
      request = { url, options };
      return new Response(null, { status: 200 });
    });
    await submitToConvexSite(payload, " pk_project ");
    assert.equal(request?.url, "https://example.test/feedback");
    assert.equal(request?.options?.method, "POST");
    assert.deepEqual(JSON.parse(String(request?.options?.body)), {
      ...payload,
      apiKey: "pk_project",
    });
    assert.equal("apiKey" in payload, false);
  });

  test("requires the local environment URL and project key before fetching", async () => {
    let requests = 0;
    replaceFetch(async () => {
      requests += 1;
      return new Response(null, { status: 200 });
    });
    delete process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
    await assert.rejects(
      submitToConvexSite(payload, "pk_project"),
      /NEXT_PUBLIC_CONVEX_SITE_URL/,
    );
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.test";
    await assert.rejects(submitToConvexSite(payload, " "), /project key/);
    assert.equal(requests, 0);
  });

  test("keeps rate-limit details available to the widget", async () => {
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.test";
    replaceFetch(async () =>
      Response.json({ retryAfter: 1000 }, { status: 429 }),
    );
    await assert.rejects(
      submitToConvexSite(payload, "pk_project"),
      (error: unknown) => {
        assert.ok(error instanceof WidgetSubmitError);
        assert.equal(error.code, "rate_limited");
        assert.equal(error.status, 429);
        assert.equal(error.retryAfterMs, 1000);
        return true;
      },
    );
  });
});
