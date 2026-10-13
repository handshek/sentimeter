import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { parseForwardedIp, prepareWaitlistSignup } from "./waitlist-request";

describe("waitlist request preparation", () => {
  test("takes the first forwarded IP and normalizes IPv6 spelling", () => {
    assert.equal(parseForwardedIp(" 203.0.113.7, 10.0.0.1 "), "203.0.113.7");
    assert.equal(parseForwardedIp("2001:0DB8:0:0:0:0:0:1"), "2001:db8::1");
    assert.equal(parseForwardedIp("::1"), "::1");
  });

  test("uses a shared bucket for missing or malformed IPs", () => {
    for (const value of [
      null,
      "",
      "unknown",
      "999.1.2.3",
      "203.0.113.7:443",
      "[::1]",
      "fe80::1%lo0",
      "bad, 203.0.113.7",
      ", 203.0.113.7",
    ]) {
      assert.equal(parseForwardedIp(value), "unknown");
    }
  });

  test("drops honeypot hits before validating or submitting an email", () => {
    for (const honeypot of ["https://spam.example", " ", new Blob(["spam"])]) {
      assert.deepEqual(
        prepareWaitlistSignup({
          email: "not-an-email",
          honeypot,
          forwardedFor: null,
        }),
        { kind: "drop" },
      );
    }
  });

  test("validates email and supplies a bounded IP value for the mutation", () => {
    assert.deepEqual(
      prepareWaitlistSignup({
        email: " Developer@Example.com ",
        honeypot: "",
        forwardedFor: "203.0.113.7, 10.0.0.1",
      }),
      { kind: "join", email: "developer@example.com", ip: "203.0.113.7" },
    );
    assert.deepEqual(
      prepareWaitlistSignup({
        email: "bad",
        honeypot: null,
        forwardedFor: null,
      }),
      { kind: "invalid" },
    );
    assert.deepEqual(
      prepareWaitlistSignup({
        email: "developer@example.com",
        honeypot: null,
        forwardedFor: null,
      }),
      { kind: "join", email: "developer@example.com", ip: "unknown" },
    );
  });
});
