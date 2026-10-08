import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  clampFeedbackLimit,
  classifyFeedbackSentiment,
  getCorsOrigin,
  getFeedbackRangeBounds,
  isFeedbackValueAllowed,
  MAX_FEEDBACK_LOCATION_LENGTH,
  MAX_FEEDBACK_TEXT_LENGTH,
  normalizeAllowedOrigins,
  normalizeFeedbackLocation,
  normalizeFeedbackText,
  normalizeOrigin,
  rankTopLocations,
} from "./feedbackDomain";

describe("feedback domain rules", () => {
  test("validates widget values by widget type", () => {
    assert.equal(isFeedbackValueAllowed("thumbs", 0), true);
    assert.equal(isFeedbackValueAllowed("thumbs", 1), true);
    assert.equal(isFeedbackValueAllowed("thumbs", 2), false);

    assert.equal(isFeedbackValueAllowed("emoji", 1), true);
    assert.equal(isFeedbackValueAllowed("emoji", 5), true);
    assert.equal(isFeedbackValueAllowed("emoji", 3.5), false);
    assert.equal(isFeedbackValueAllowed("star", 0), false);
  });

  test("classifies sentiment consistently across widget types", () => {
    assert.equal(classifyFeedbackSentiment("thumbs", 1), "positive");
    assert.equal(classifyFeedbackSentiment("thumbs", 0), "negative");
    assert.equal(classifyFeedbackSentiment("star", 5), "positive");
    assert.equal(classifyFeedbackSentiment("emoji", 3), "neutral");
    assert.equal(classifyFeedbackSentiment("emoji", 1), "negative");
  });

  test("trims and caps submitter-controlled location and text", () => {
    assert.equal(normalizeFeedbackLocation("  /pricing  "), "/pricing");
    assert.equal(normalizeFeedbackLocation("   "), null);
    assert.equal(
      normalizeFeedbackLocation("/".repeat(1000))?.length,
      MAX_FEEDBACK_LOCATION_LENGTH,
    );

    assert.equal(normalizeFeedbackText("  great  "), "great");
    assert.equal(normalizeFeedbackText("   "), undefined);
    assert.equal(
      normalizeFeedbackText("a".repeat(1000))?.length,
      MAX_FEEDBACK_TEXT_LENGTH,
    );
  });

  test("ranks top locations as rows so any location string is safe", () => {
    const counts = new Map<string, number>([
      ["$reserved", 2],
      ["_system", 2],
      ["/", 5],
    ]);
    for (let index = 0; index < 20; index += 1) {
      counts.set(`/page-${index}`, 1);
    }

    const top = rankTopLocations(counts);

    assert.equal(top.length, 8);
    assert.deepEqual(top.slice(0, 3), [
      { location: "/", total: 5 },
      { location: "$reserved", total: 2 },
      { location: "_system", total: 2 },
    ]);
  });

  test("normalizes and deduplicates allowed origins", () => {
    assert.deepEqual(
      normalizeAllowedOrigins([
        " https://example.com/path ",
        "https://example.com/other",
        "http://localhost:3000/dashboard",
      ]),
      ["https://example.com", "http://localhost:3000"],
    );
  });

  test("rejects invalid origins", () => {
    assert.throws(
      () => normalizeAllowedOrigins(["not a url"]),
      /invalid_origin/,
    );
  });

  test("resolves CORS origin from allowlist policy", () => {
    assert.equal(getCorsOrigin([], null), "*");
    assert.equal(getCorsOrigin(undefined, "https://example.com"), "*");
    assert.equal(
      getCorsOrigin(["https://example.com"], "https://example.com"),
      "https://example.com",
    );
    assert.equal(
      getCorsOrigin(["https://example.com"], "https://evil.test"),
      null,
    );
  });

  test("normalizes request origins", () => {
    assert.equal(
      normalizeOrigin("https://example.com/path?q=1"),
      "https://example.com",
    );
    assert.equal(normalizeOrigin("bad"), null);
  });

  test("clamps feedback limits", () => {
    assert.equal(clampFeedbackLimit(Number.NaN), 50);
    assert.equal(clampFeedbackLimit(0), 1);
    assert.equal(clampFeedbackLimit(42.9), 42);
    assert.equal(clampFeedbackLimit(999), 200);
  });

  test("computes range bounds with injectable clock", () => {
    const now = 1_700_000_000_000;
    assert.deepEqual(getFeedbackRangeBounds("all", now), { to: now });
    assert.deepEqual(getFeedbackRangeBounds("24h", now), {
      from: now - 24 * 60 * 60 * 1000,
      to: now,
    });
  });
});
