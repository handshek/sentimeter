import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatResponseVolumeSummary } from "./project-accessibility";

describe("formatResponseVolumeSummary", () => {
  test("summarizes sentiment totals and the number of time periods", () => {
    assert.equal(
      formatResponseVolumeSummary({
        rangeLabel: "the last 7 days",
        points: [
          { total: 4, positive: 2, neutral: 1, negative: 1 },
          { total: 3, positive: 2, neutral: 0, negative: 1 },
        ],
      }),
      "Response volume for the last 7 days: 7 total responses — 4 positive, 1 neutral, and 2 negative across 2 time periods.",
    );
  });

  test("describes an empty chart without implying missing data", () => {
    assert.equal(
      formatResponseVolumeSummary({
        rangeLabel: "all time",
        points: [],
      }),
      "Response volume for all time: no responses.",
    );
  });
});
