import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { DEFAULT_FEEDBACK_ENDPOINT, submitFeedback } from "./submit";
import type { WidgetPayload } from "../types";

const payload: WidgetPayload = {
  apiKey: "pk_test",
  location: "/pricing",
  widgetType: "emoji",
  value: 5,
};

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("submitFeedback", () => {
  test("skips network calls without an api key", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return new Response(null, { status: 200 });
    };

    await submitFeedback({ ...payload, apiKey: "" });

    assert.equal(called, false);
  });

  test("uses the default endpoint when override is blank", async () => {
    let requestedUrl = "";
    globalThis.fetch = async (input) => {
      requestedUrl = String(input);
      return new Response(null, { status: 200 });
    };

    await submitFeedback(payload, "   ");

    assert.equal(requestedUrl, DEFAULT_FEEDBACK_ENDPOINT);
  });

  test("posts JSON payloads to the selected endpoint", async () => {
    let method = "";
    let contentType = "";
    let body = "";
    globalThis.fetch = async (_input, init) => {
      method = init?.method ?? "";
      contentType = String(
        (init?.headers as Record<string, string>)?.["Content-Type"],
      );
      body = String(init?.body);
      return new Response(null, { status: 200 });
    };

    await submitFeedback(payload, "https://example.com/feedback");

    assert.equal(method, "POST");
    assert.equal(contentType, "application/json");
    assert.deepEqual(JSON.parse(body), payload);
  });

  test("throws server error codes when available", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "origin_not_allowed" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(submitFeedback(payload), /origin_not_allowed/);
  });
});
