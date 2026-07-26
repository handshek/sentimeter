import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, test } from "node:test";
import {
  createExpectedRegistry,
  planRegistryArtifacts,
  RegistryAdapterError,
  SOURCE_MAPPINGS,
  validateManifest,
  type SourceMapping,
} from "./registry-plan";

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsRoot, "../../..");
const widgetSourceRoot = path.join(repoRoot, "packages", "widgets", "src");
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("Registry Item plan", () => {
  test("emits deterministic modular artifacts with exact import rewrites", async () => {
    const [first, second] = await Promise.all([
      planRegistryArtifacts({ sourceRoot: widgetSourceRoot }),
      planRegistryArtifacts({ sourceRoot: widgetSourceRoot }),
    ]);

    assert.deepEqual(first, second);
    assert.equal(first.length, SOURCE_MAPPINGS.length);
    const generated = first.map((artifact) => artifact.content).join("\n");
    assert.doesNotMatch(generated, /@workspace\//);
    assert.doesNotMatch(generated, /@repo\//);
    assert.match(generated, /@\/components\/ui\/button/);
    assert.match(generated, /@\/components\/ui\/textarea/);
    assert.match(generated, /@\/lib\/utils/);

    const preset = first.find(
      (artifact) => artifact.source === "emoji-feedback.tsx",
    );
    assert.equal(
      preset?.content,
      await readFile(path.join(widgetSourceRoot, "emoji-feedback.tsx"), "utf8"),
    );
  });

  test("rejects forbidden workspace and undeclared external imports", async () => {
    const sourceRoot = await makeSourceRoot();
    const mapping = singleMapping();

    await writeFile(
      path.join(sourceRoot, "entry.ts"),
      'import "@repo/private";\n',
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

  test("rejects missing canonical source", async () => {
    const sourceRoot = await makeSourceRoot();
    await assert.rejects(
      planRegistryArtifacts({
        sourceRoot,
        mappings: [singleMapping()],
      }),
      isAdapterError("missing_source"),
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

  test("rejects duplicate targets and manifest drift", () => {
    const mapping = singleMapping();
    assert.throws(
      () =>
        createExpectedRegistry([
          mapping,
          { ...mapping, source: "other.ts", staged: "other.ts" },
        ]),
      isAdapterError("artifact_conflict"),
    );
    assert.throws(
      () => validateManifest({ name: "drifted" }),
      isAdapterError("invalid_manifest"),
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
