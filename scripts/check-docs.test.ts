import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectDocs } from "./check-docs";

const root = mkdtempSync(join(tmpdir(), "sentimeter-docs-"));
mkdirSync(join(root, "scripts"));
writeFileSync(join(root, "scripts/check.ts"), "");
writeFileSync(
  join(root, "package.json"),
  JSON.stringify({ scripts: { test: "bun test" } }),
);
afterAll(() => rmSync(root, { recursive: true, force: true }));
const messages = (source: string, file = "README.md") =>
  inspectDocs(file, source, root).map((finding) => finding.message);

describe("documentation guard", () => {
  test.each([
    ["`scripts/missing.ts`", "Missing repo path: scripts/missing.ts"],
    ["`bun run missing`", "Unknown bun script: missing"],
    ["```sh\nbun run missing\n```", "Unknown bun script: missing"],
    ["[missing](missing.md)", "Missing Markdown target: missing.md"],
    ["[escape](../package.json)", "Missing Markdown target: ../package.json"],
  ])("rejects drift: %s", (source, message) => {
    expect(messages(source)).toEqual([message]);
  });

  test("requires every root script in the command table", () => {
    expect(messages("`bun run test`", "AGENTS.md")).toEqual([
      "Root script missing from command table: test",
    ]);
    expect(messages("| `bun run test` | Tests |", "AGENTS.md")).toEqual([]);
  });

  test("accepts real paths and commands and ignores globs, placeholders and host paths", () => {
    expect(
      messages(
        "`scripts/check.ts` `package.json` `bun run test` `scripts/*.ts` `scripts/<path>.ts` `@/host/file` `components.json` `feedback-system/design-system.ts`\n```ts\nconst example = `scripts/missing.ts`;\n```\n[web](https://example.com) [anchor](#here)",
      ),
    ).toEqual([]);
  });

  test("resolves package commands and paths beside a README", () => {
    writeFileSync(
      join(root, "scripts/package.json"),
      JSON.stringify({ scripts: { local: "true" } }),
    );
    expect(messages("`check.ts` `bun run local`", "scripts/README.md")).toEqual(
      [],
    );
  });

  test("checks links but not inline references in other Markdown", () => {
    expect(
      messages("`scripts/missing.ts` `bun run missing`", "docs/note.md"),
    ).toEqual([]);
  });

  test("checks commands only in inline or fenced code", () => {
    expect(messages("Use bun run the tests to verify the change.")).toEqual([]);
  });

  test("accepts bun file targets and rejects missing ones", () => {
    expect(messages("`bun run scripts/check.ts`")).toEqual([]);
    expect(messages("`bun run scripts/missing.ts`")).toEqual([
      "Missing bun target: scripts/missing.ts",
    ]);
  });

  test("checks the command after bun flags", () => {
    expect(messages("`bun run --filter=web missing`")).toEqual([
      "Unknown bun script: missing",
    ]);
  });

  test("finds the nearest manifest and honors an explicit cwd", () => {
    mkdirSync(join(root, "workspace/nested"), { recursive: true });
    writeFileSync(
      join(root, "workspace/package.json"),
      JSON.stringify({ scripts: { local: "true" } }),
    );
    expect(
      messages("`bun run local` `bun run test`", "workspace/nested/README.md"),
    ).toEqual([]);
    expect(messages("`bun run --cwd workspace local`")).toEqual([]);
    expect(messages("`bun run --cwd=workspace missing`")).toEqual([
      "Unknown bun script: missing",
    ]);
  });

  test("accepts line and column suffixes on repo paths", () => {
    expect(messages("`scripts/check.ts:10` `scripts/check.ts:10:3`")).toEqual(
      [],
    );
    expect(messages("`scripts/missing.ts:10:3`")).toEqual([
      "Missing repo path: scripts/missing.ts:10:3",
    ]);
  });

  test("accepts generated paths relative to a README before a build", () => {
    expect(
      messages(
        "`public/r` `public/r/` `.generated/` `worker-configuration.d.ts`",
        "apps/registry/README.md",
      ),
    ).toEqual([]);
  });

  test("does not treat full URLs as repo files", () => {
    expect(
      messages(
        "`https://sentimeter.dev/r/widget.json` `http://localhost:3000/llms.md`",
      ),
    ).toEqual([]);
  });

  test("ignores bare domains with URL paths", () => {
    expect(messages("`sentimeter.dev/r/foo.json`")).toEqual([]);
  });

  test("does not check repo references inside indented fences", () => {
    expect(
      messages(
        "1. Example:\n   ```ts\n   const example = `scripts/missing.ts`;\n   ```",
      ),
    ).toEqual([]);
    expect(messages("1. Run:\n   ```sh\n   bun run missing\n   ```")).toEqual([
      "Unknown bun script: missing",
    ]);
  });

  test("rejects existing paths outside the repository", () => {
    const outside = mkdtempSync(join(tmpdir(), "sentimeter-docs-outside-"));
    try {
      writeFileSync(join(outside, "found.ts"), "");
      const path = `../${outside.split("/").at(-1)}/found.ts`;
      expect(messages(`\`${path}\``)).toEqual([`Missing repo path: ${path}`]);
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });
});
