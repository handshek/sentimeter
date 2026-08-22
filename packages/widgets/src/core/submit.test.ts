import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import {
  DEFAULT_FEEDBACK_ENDPOINT,
  submitFeedback,
  WidgetSubmitError,
  type WidgetPayload,
} from "../index";

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
  test("rejects hosted submissions without an api key", async () => {
    let called = false;
    globalThis.fetch = async () => {
      called = true;
      return new Response(null, { status: 200 });
    };

    await assert.rejects(
      submitFeedback({ ...payload, apiKey: "   " }),
      (error: unknown) =>
        error instanceof WidgetSubmitError &&
        error.code === "missing_api_key" &&
        error.message === "Add an API key before sending feedback.",
    );

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

  test("normalizes known server failures for display", async () => {
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ error: "rate_limited", retryAfter: 4500 }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );

    await assert.rejects(submitFeedback(payload), (error: unknown) => {
      assert.ok(error instanceof WidgetSubmitError);
      assert.equal(error.code, "rate_limited");
      assert.equal(error.status, 429);
      assert.equal(error.retryAfterMs, 4500);
      assert.equal(error.message, "Too many responses. Please try again soon.");
      return true;
    });
  });

  test("maps unrecognized server failures to a safe unknown error", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "database_details" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });

    await assert.rejects(submitFeedback(payload), (error: unknown) => {
      assert.ok(error instanceof WidgetSubmitError);
      assert.equal(error.code, "unknown");
      assert.equal(error.status, 500);
      assert.equal(error.message, "We couldn't send your feedback. Try again.");
      return true;
    });
  });

  test("normalizes network failures while preserving the original cause", async () => {
    const cause = new TypeError("internal fetch details");
    globalThis.fetch = async () => {
      throw cause;
    };

    await assert.rejects(submitFeedback(payload), (error: unknown) => {
      assert.ok(error instanceof WidgetSubmitError);
      assert.equal(error.code, "network_error");
      assert.equal(error.message, "Check your connection and try again.");
      assert.equal(error.cause, cause);
      return true;
    });
  });
});
