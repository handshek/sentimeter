import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatFeedbackFeedSummary } from "./feedback-feed-summary";

describe("formatFeedbackFeedSummary", () => {
  test("shows a loading message until feed counts are available", () => {
    assert.equal(
      formatFeedbackFeedSummary({
        loadedCount: undefined,
        totalCount: undefined,
        visibleCount: 0,
        hasLocalFilters: false,
      }),
      "Loading feedback…",
    );
  });

  test("reports when the complete result set is visible", () => {
    assert.equal(
      formatFeedbackFeedSummary({
        loadedCount: 12,
        totalCount: 12,
        visibleCount: 12,
        hasLocalFilters: false,
      }),
      "Showing all 12 responses",
    );
  });

  test("reports when only the latest results are visible", () => {
    assert.equal(
      formatFeedbackFeedSummary({
        loadedCount: 50,
        totalCount: 127,
        visibleCount: 50,
        hasLocalFilters: false,
      }),
      "Showing latest 50 of 127 responses",
    );
  });

  test("scopes local filter matches to the loaded results", () => {
    assert.equal(
      formatFeedbackFeedSummary({
        loadedCount: 50,
        totalCount: 127,
        visibleCount: 8,
        hasLocalFilters: true,
      }),
      "8 matches in the latest 50 responses",
    );
  });

  test("reports local matches across a fully loaded result set", () => {
    assert.equal(
      formatFeedbackFeedSummary({
        loadedCount: 12,
        totalCount: 12,
        visibleCount: 8,
        hasLocalFilters: true,
      }),
      "8 of 12 responses match",
    );
  });

  test("reports an empty result set without implying a capped feed", () => {
    assert.equal(
      formatFeedbackFeedSummary({
        loadedCount: 0,
        totalCount: 0,
        visibleCount: 0,
        hasLocalFilters: true,
      }),
      "Showing all 0 responses",
    );
  });

  test("uses singular labels for one result", () => {
    assert.equal(
      formatFeedbackFeedSummary({
        loadedCount: 1,
        totalCount: 1,
        visibleCount: 1,
        hasLocalFilters: true,
      }),
      "1 of 1 response matches",
    );
  });
});
