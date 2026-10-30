import { describe, expect, test } from "bun:test";
import { ESLint } from "eslint";
import { resolve } from "node:path";

async function typedPromiseMessages(source: string) {
  const eslint = new ESLint({
    cwd: resolve(import.meta.dir, "../apps/registry"),
  });
  const results = await eslint.lintText(source, {
    filePath: "scripts/registry-plan.test.ts",
  });
  return results.flatMap((result) => result.messages);
}

describe("typed promise guard", () => {
  test.each(["node:test", "bun:test"])(
    "allows bare describe and test registration from %s",
    async (module) => {
      expect(
        await typedPromiseMessages(`import { describe, test } from "${module}";
        describe("suite", () => { test("case", () => {}); });`),
      ).toEqual([]);
    },
  );
  test.each(["node:test", "bun:test"])(
    "rejects floating promises inside %s test bodies",
    async (module) => {
      const messages =
        await typedPromiseMessages(`import { test } from "${module}";
        test("case", () => {
          Promise.resolve("unsaved feedback");
        });`);
      expect(messages.map(({ ruleId, line }) => ({ ruleId, line }))).toEqual([
        { ruleId: "@typescript-eslint/no-floating-promises", line: 3 },
      ]);
    },
  );
  test("rejects unrelated async functions named test", async () => {
    const messages = await typedPromiseMessages(`async function test() {}
      test();`);
    expect(messages.map(({ ruleId }) => ruleId)).toEqual([
      "@typescript-eslint/no-floating-promises",
    ]);
  });
});

async function restrictedSyntax(
  source: string,
  workspace = "packages/widgets",
  filePath = "src/guard-seed.tsx",
  rule = "no-restricted-syntax",
) {
  const eslint = new ESLint({
    cwd: resolve(import.meta.dir, "..", workspace),
    overrideConfig: {
      languageOptions: { parserOptions: { projectService: false } },
      rules: { "@typescript-eslint/no-floating-promises": "off" },
    },
  });
  const results = await eslint.lintText(source, { filePath });
  return results
    .flatMap((result) => result.messages)
    .filter((message) => message.ruleId === rule);
}

describe("widget observer guard", () => {
  test.each([
    "onCancel()",
    "onSelect?.(1)",
    "props.onReset()",
    "props.onCancel?.()",
    'props["onCancel"]()',
  ])("rejects direct callbacks: %s", async (source) => {
    expect(
      (await restrictedSyntax(source)).map((message) => message.message),
    ).toEqual([
      "Route host observers through notify so their failures stay isolated.",
    ]);
  });
  test("allows notify and DOM handler props", async () => {
    expect(
      await restrictedSyntax(
        "notify(onCancel); const view = <Button onClick={cancel} />; function notify(callback) { callback?.(); }",
      ),
    ).toEqual([]);
  });
});

describe("web primitive guard", () => {
  test.each(["button", "input", "textarea", "select", "label", "svg"])(
    "rejects raw %s",
    async (tag) => {
      expect(
        (
          await restrictedSyntax(
            `<${tag} />`,
            "apps/web",
            "components/guard-seed.tsx",
          )
        ).map((message) => message.message),
      ).toEqual(["Use shared shadcn controls and lucide-react icons."]);
    },
  );
  test("allows shared controls and icons", async () => {
    expect(
      await restrictedSyntax(
        "const view = <><Button /><Input /><Textarea /><Select /><Label /><Search /></>;",
        "apps/web",
        "components/guard-seed.tsx",
      ),
    ).toEqual([]);
  });
});

describe("web import guard", () => {
  test.each([
    'import { value } from "../other";',
    'export { value } from "../../other";',
    'import value from "./../other";',
    'import value from "..";',
  ])("rejects parent imports: %s", async (source) => {
    const findings = await restrictedSyntax(
      source,
      "apps/web",
      "lib/guard-seed.ts",
      "no-restricted-imports",
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain(
      "Use @/ imports outside the current folder.",
    );
  });
  test.each(["lib/guard-seed.ts", "components/guard-seed.tsx"])(
    "rejects dynamic parent imports in %s",
    async (file) => {
      expect(
        (await restrictedSyntax('import("../other")', "apps/web", file)).map(
          (message) => message.message,
        ),
      ).toEqual(["Use @/ imports outside the current folder."]);
    },
  );
  test("allows own-folder and alias imports and exempts Convex", async () => {
    expect(
      await restrictedSyntax(
        'import "./own"; import "@/lib/other";',
        "apps/web",
        "lib/guard-seed.ts",
        "no-restricted-imports",
      ),
    ).toEqual([]);
    expect(
      await restrictedSyntax(
        'import "../_generated/api";',
        "apps/web",
        "convex/lib/guardSeed.ts",
        "no-restricted-imports",
      ),
    ).toEqual([]);
  });
});
