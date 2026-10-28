import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { hostedRedirect, resolveHostedMode } from "./hosted-config";

const hostedConfiguration = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "clerk-public-test",
  CLERK_SECRET_KEY: "clerk-secret-test",
  NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
};
const waitlistConfiguration = {
  NEXT_PUBLIC_CONVEX_URL: hostedConfiguration.NEXT_PUBLIC_CONVEX_URL,
  WAITLIST_SECRET: "waitlist-test-secret",
};

describe("hosted mode", () => {
  test("hosted routes stay closed without the explicit opt-in", () => {
    for (const NODE_ENV of ["development", "production"] as const) {
      assert.equal(
        resolveHostedMode({ ...hostedConfiguration, NODE_ENV }),
        "off",
      );
      assert.equal(
        resolveHostedMode({
          ...hostedConfiguration,
          ...waitlistConfiguration,
          NODE_ENV,
        }),
        "waitlist",
      );
    }
  });

  test("HOSTED_ANALYTICS=live opens hosted routes in any environment", () => {
    for (const NODE_ENV of ["development", "production"] as const) {
      assert.equal(
        resolveHostedMode({
          ...hostedConfiguration,
          ...waitlistConfiguration,
          NODE_ENV,
          HOSTED_ANALYTICS: "live",
        }),
        "live",
      );
    }
  });

  test("live opt-in still needs all hosted configuration", () => {
    for (const missing of Object.keys(hostedConfiguration)) {
      const environment: NodeJS.ProcessEnv = {
        ...hostedConfiguration,
        NODE_ENV: "production",
        HOSTED_ANALYTICS: "live",
      };
      delete environment[missing];
      assert.equal(resolveHostedMode(environment), "off");
    }
  });

  test("waitlist works without Clerk and requires both its URL and secret", () => {
    assert.equal(
      resolveHostedMode({ ...waitlistConfiguration, NODE_ENV: "production" }),
      "waitlist",
    );
    assert.equal(
      resolveHostedMode({
        NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
      }),
      "off",
    );
    assert.equal(resolveHostedMode({ WAITLIST_SECRET: "test-secret" }), "off");
    assert.equal(
      resolveHostedMode({ ...waitlistConfiguration, WAITLIST_SECRET: "   " }),
      "off",
    );
    assert.equal(resolveHostedMode({}), "off");
  });

  test("closed modes redirect auth and project routes without looping dashboard", () => {
    for (const mode of ["waitlist", "off"] as const) {
      for (const pathname of [
        "/sign-in",
        "/sign-in/sso-callback",
        "/sign-up",
        "/sign-up/verify-email",
        "/dashboard/projects/project-test",
        "/dashboard/",
      ]) {
        assert.equal(hostedRedirect(pathname, mode), "/dashboard");
      }
      assert.equal(hostedRedirect("/widgets", mode), "/components");
      assert.equal(hostedRedirect("/dashboard", mode), null);
      assert.equal(hostedRedirect("/components", mode), null);
    }
    assert.equal(
      hostedRedirect("/dashboard/projects/project-test", "live"),
      null,
    );
    assert.equal(hostedRedirect("/sign-in", "live"), null);
    assert.equal(hostedRedirect("/widgets", "live"), null);
  });
});
