import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, test } from "node:test";
import {
  createExpectedRegistry,
  planRegistryArtifacts,
  RegistryAdapterError,
  type SourceMapping,
} from "./registry-plan";

const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("Registry Item plan", () => {
  test("rewrites each workspace import in place and leaves the rest", async () => {
    const sourceRoot = await makeSourceRoot();
    await writeFile(
      path.join(sourceRoot, "entry.ts"),
      'import { Button } from "@workspace/ui/components/button";\nimport { cn } from "@workspace/ui/lib/utils";\nimport * as React from "react";\n',
      "utf8",
    );
    const [artifact] = await planRegistryArtifacts({
      sourceRoot,
      mappings: [singleMapping()],
    });
    assert.equal(
      artifact?.content,
      'import { Button } from "@/components/ui/button";\nimport { cn } from "@/lib/utils";\nimport * as React from "react";\n',
    );
  });

  test("rejects forbidden workspace and undeclared external imports", async () => {
    const sourceRoot = await makeSourceRoot();
    const mapping = singleMapping();

    await writeFile(
      path.join(sourceRoot, "entry.ts"),
      'import "@workspace/private";\n',
      "utf8",
    );
    await assert.rejects(
      planRegistryArtifacts({ sourceRoot, mappings: [mapping] }),
      isAdapterError("bad_import"),
    );

    await writeFile(
      path.join(sourceRoot, "entry.ts"),
      'import "unexpected-package";\n',
      "utf8",
    );
    await assert.rejects(
      planRegistryArtifacts({ sourceRoot, mappings: [mapping] }),
      isAdapterError("bad_import"),
    );
  });

  test("rejects unsupported dynamic module loads", async () => {
    const sourceRoot = await makeSourceRoot();
    await writeFile(
      path.join(sourceRoot, "entry.ts"),
      'export async function load() { return import("react"); }\n',
      "utf8",
    );

    await assert.rejects(
      planRegistryArtifacts({
        sourceRoot,
        mappings: [singleMapping()],
      }),
      isAdapterError("bad_import"),
    );
  });

  test("rejects relative imports broken by staged relocation", async () => {
    const sourceRoot = await makeSourceRoot();
    await writeFile(
      path.join(sourceRoot, "entry.ts"),
      'export { value } from "./dependency";\n',
      "utf8",
    );
    await writeFile(
      path.join(sourceRoot, "dependency.ts"),
      "export const value = 1;\n",
      "utf8",
    );
    const mappings: readonly SourceMapping[] = [
      {
        ...singleMapping(),
        staged: "nested/index.ts",
      },
      {
        source: "dependency.ts",
        staged: "dependency.ts",
        target: "components/sentimeter/dependency.ts",
        item: "feedback-system",
      },
    ];

    await assert.rejects(
      planRegistryArtifacts({ sourceRoot, mappings }),
      isAdapterError("relative_import_not_mapped"),
    );
  });

  test("rejects duplicate targets", () => {
    const mapping = singleMapping();
    assert.throws(
      () =>
        createExpectedRegistry([
          mapping,
          { ...mapping, source: "other.ts", staged: "other.ts" },
        ]),
      isAdapterError("artifact_conflict"),
    );
  });
});

async function makeSourceRoot(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "sentimeter-plan-"));
  temporaryRoots.push(root);
  await mkdir(root, { recursive: true });
  return root;
}

function singleMapping(): SourceMapping {
  return {
    source: "entry.ts",
    staged: "entry.ts",
    target: "components/sentimeter/entry.ts",
    item: "feedback-system",
  };
}

function isAdapterError(code: RegistryAdapterError["code"]) {
  return (error: unknown): boolean =>
    error instanceof RegistryAdapterError && error.code === code;
}
