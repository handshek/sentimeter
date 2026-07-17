import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { cx } from "./ui";

describe("cx", () => {
  test("joins truthy class names", () => {
    assert.equal(
      cx("flex", undefined, false, null, "items-center"),
      "flex items-center",
    );
  });

  test("returns an empty string when all parts are empty", () => {
    assert.equal(cx(undefined, false, null), "");
  });
});
