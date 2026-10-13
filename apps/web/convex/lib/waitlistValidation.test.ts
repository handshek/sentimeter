import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { normalizeWaitlistEmail } from "./waitlistValidation";

describe("waitlist email validation", () => {
  test("trims and lowercases addresses for duplicate detection", () => {
    assert.equal(
      normalizeWaitlistEmail("  Developer+Launch@Example.COM  "),
      "developer+launch@example.com",
    );
    assert.equal(
      normalizeWaitlistEmail("first.last@example.co.uk"),
      "first.last@example.co.uk",
    );
  });

  test("accepts a 254-character address and rejects longer addresses", () => {
    const domain = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(61)}`;
    const email = `${"d".repeat(64)}@${domain}`;
    assert.equal(email.length, 254);
    assert.equal(normalizeWaitlistEmail(email), email);
    assert.equal(normalizeWaitlistEmail(`${email}x`), null);
    assert.equal(normalizeWaitlistEmail(`${"a".repeat(65)}@example.com`), null);
  });

  test("rejects malformed addresses and non-text form values", () => {
    for (const value of [
      null,
      undefined,
      42,
      "",
      "developer",
      "developer@localhost",
      "developer@@example.com",
      "developer name@example.com",
      ".developer@example.com",
      "developer.@example.com",
      "developer..name@example.com",
      "developer@-example.com",
      "developer@example-.com",
      "developer@example..com",
      "developer@example.com/path",
      "developer@example.com\nother@example.com",
    ]) {
      assert.equal(normalizeWaitlistEmail(value), null);
    }
  });
});
