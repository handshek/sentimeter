import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import { afterEach, beforeEach, describe, spyOn, test } from "bun:test";
import { makeFunctionReference } from "convex/server";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

// The component's test helper uses Vite's import.meta.glob; use Bun's glob here.
const componentDirectory = new URL(
  "./component/",
  import.meta.resolve("@convex-dev/rate-limiter/test"),
);
const { default: componentSchema } = await import(
  new URL("schema.ts", componentDirectory).href
);
const componentModules = Object.fromEntries(
  Array.from(
    new Glob("**/*.ts").scanSync({ cwd: fileURLToPath(componentDirectory) }),
    (path) => [path, () => import(new URL(path, componentDirectory).href)],
  ),
);

function createBackend() {
  const t = convexTest(schema, {
    "./_generated/server.js": () => import("./_generated/server.js"),
    "./waitlist.ts": () => import("./waitlist"),
  });
  t.registerComponent("rateLimiter", componentSchema, componentModules);
  return t;
}

const signup = {
  email: "developer@example.com",
  ip: "192.0.2.1",
  source: "dashboard",
  secret: "test-waitlist-secret",
};

describe("waitlist.join mutation", () => {
  let previousSecret: string | undefined;
  let clock: ReturnType<typeof spyOn<typeof Date, "now">>;

  beforeEach(() => {
    previousSecret = process.env.WAITLIST_SECRET;
    process.env.WAITLIST_SECRET = signup.secret;
    clock = spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    if (previousSecret === undefined) delete process.env.WAITLIST_SECRET;
    else process.env.WAITLIST_SECRET = previousSecret;
    clock.mockRestore();
  });

  test("rejects a wrong secret without writing a row", async () => {
    const t = createBackend();
    await assert.rejects(
      t.mutation(api.waitlist.join, { ...signup, secret: "wrong-secret" }),
      /unauthorized/,
    );
    assert.deepEqual(
      await t.run((ctx) => ctx.db.query("waitlist").collect()),
      [],
    );
  });

  test("rejects a missing server secret without writing a row", async () => {
    delete process.env.WAITLIST_SECRET;
    const t = createBackend();
    await assert.rejects(t.mutation(api.waitlist.join, signup), /unauthorized/);
    assert.deepEqual(
      await t.run((ctx) => ctx.db.query("waitlist").collect()),
      [],
    );
  });

  test("rejects a missing request secret without writing a row", async () => {
    const t = createBackend();
    const joinWithoutSecret = makeFunctionReference<
      "mutation",
      Omit<typeof signup, "secret">
    >("waitlist:join");
    await assert.rejects(
      t.mutation(joinWithoutSecret, {
        email: signup.email,
        ip: signup.ip,
        source: signup.source,
      }),
      /secret/,
    );
    assert.deepEqual(
      await t.run((ctx) => ctx.db.query("waitlist").collect()),
      [],
    );
  });

  test("returns invalid for an invalid email without writing a row", async () => {
    const t = createBackend();
    assert.equal(
      await t.mutation(api.waitlist.join, {
        ...signup,
        email: "invalid-email",
      }),
      "invalid",
    );
    assert.deepEqual(
      await t.run((ctx) => ctx.db.query("waitlist").collect()),
      [],
    );
  });

  test("joins successfully with one lowercased email row", async () => {
    const t = createBackend();
    assert.equal(
      await t.mutation(api.waitlist.join, {
        ...signup,
        email: "  Developer@Example.COM  ",
      }),
      "ok",
    );
    const rows = await t.run((ctx) => ctx.db.query("waitlist").collect());
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.email, signup.email);
    assert.equal(rows[0]?.source, signup.source);
    assert.equal(rows[0]?.createdAt, Date.now());
  });

  test("returns ok for a duplicate and keeps one row", async () => {
    const t = createBackend();
    assert.equal(await t.mutation(api.waitlist.join, signup), "ok");
    assert.equal(
      await t.mutation(api.waitlist.join, {
        ...signup,
        email: "DEVELOPER@EXAMPLE.COM",
      }),
      "ok",
    );
    assert.equal(
      (await t.run((ctx) => ctx.db.query("waitlist").collect())).length,
      1,
    );
  });

  test("rate limits the sixth signup from one IP without an extra row", async () => {
    const t = createBackend();
    for (let index = 0; index < 5; index++) {
      assert.equal(
        await t.mutation(api.waitlist.join, {
          ...signup,
          email: `developer${index}@example.com`,
        }),
        "ok",
      );
    }
    assert.equal(await t.mutation(api.waitlist.join, signup), "rate_limited");
    assert.equal(
      (await t.run((ctx) => ctx.db.query("waitlist").collect())).length,
      5,
    );
  });

  test("rate limits the 301st signup globally across distinct IPs", async () => {
    const t = createBackend();
    for (let index = 0; index < 300; index++) {
      assert.equal(
        await t.mutation(api.waitlist.join, {
          ...signup,
          email: `developer${index}@example.com`,
          ip: `test-ip-${index}`,
        }),
        "ok",
      );
    }
    assert.equal(await t.mutation(api.waitlist.join, signup), "rate_limited");
    assert.equal(
      (await t.run((ctx) => ctx.db.query("waitlist").collect())).length,
      300,
    );
  });
});
