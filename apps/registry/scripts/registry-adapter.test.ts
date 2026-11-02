import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, test } from "node:test";
import {
  createRegistryPaths,
  emitRegistry,
  replaceDirectoryAtomically,
  runRegistryCommand,
  type RegistryPaths,
  type ShadcnBuildAdapter,
} from "./registry-adapter";
import { createExpectedRegistry, RegistryAdapterError } from "./registry-plan";

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const realRepoRoot = path.resolve(scriptsRoot, "../../..");
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("Registry Item Adapter", () => {
  test("atomically emits the exact staged tree", async () => {
    const paths = await createTestPaths();
    const artifacts = await emitRegistry({ paths });

    for (const artifact of artifacts) {
      assert.doesNotMatch(artifact.content, /apiKey|FEEDBACK_ENDPOINT|fetch\(/);
    }
    assert.equal(
      await readFile(
        path.join(paths.stageRoot, "feedback-system", "index.ts"),
        "utf8",
      ),
      artifacts.find(
        (artifact) => artifact.staged === "feedback-system/index.ts",
      )?.content,
    );
  });

  test("preserves the previous directory when preparation fails", async () => {
    const root = await makeTemporaryRoot("sentimeter-atomic-");
    const target = path.join(root, "target");
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, "sentinel.txt"), "old", "utf8");

    await assert.rejects(
      replaceDirectoryAtomically(target, async (prepared) => {
        await writeFile(path.join(prepared, "sentinel.txt"), "new", "utf8");
        throw new Error("planned failure");
      }),
      /planned failure/,
    );
    assert.equal(
      await readFile(path.join(target, "sentinel.txt"), "utf8"),
      "old",
    );
  });

  test("refreshes cached hosts from site config before building registry items", async () => {
    const paths = await createTestPaths();
    const expected = createExpectedRegistry();
    const previousManifest = {
      ...expected,
      homepage: "https://previous-site.test",
      items: expected.items.map((item) =>
        item.name === "feedback-system"
          ? item
          : {
              ...item,
              registryDependencies: [
                "https://previous-registry.test/r/feedback-system.json",
              ],
            },
      ),
    };
    await writeFile(
      paths.manifestPath,
      JSON.stringify(previousManifest),
      "utf8",
    );

    await runRegistryCommand("build", {
      paths,
      shadcnBuild: writeFakeShadcnOutput,
      hostTypecheck: async () => {},
    });

    assert.deepEqual(
      JSON.parse(await readFile(paths.manifestPath, "utf8")),
      expected,
    );
  });

  test("host refresh rejects descriptor drift and changed dependency paths", async () => {
    const expected = createExpectedRegistry();
    const invalidManifests = [
      { ...expected, unexpected: true },
      { ...expected, homepage: "https://previous-site.test/unexpected" },
      {
        ...expected,
        items: expected.items.map((item) =>
          item.name === "emoji-feedback"
            ? { ...item, title: "Unexpected title" }
            : item,
        ),
      },
      {
        ...expected,
        items: expected.items.map((item) =>
          item.name === "emoji-feedback"
            ? {
                ...item,
                registryDependencies: [
                  "https://previous-registry.test/r/unexpected.json",
                ],
              }
            : item,
        ),
      },
      {
        ...expected,
        items: expected.items.map((item) =>
          item.name === "emoji-feedback"
            ? {
                ...item,
                files: item.files.map((file) => ({
                  ...file,
                  target: "components/unexpected.tsx",
                })),
              }
            : item,
        ),
      },
    ];
    for (const manifest of invalidManifests) {
      const paths = await createTestPaths();
      const original = JSON.stringify(manifest);
      await writeFile(paths.manifestPath, original, "utf8");
      await mkdir(paths.stageRoot, { recursive: true });
      await writeFile(
        path.join(paths.stageRoot, "sentinel.txt"),
        "old",
        "utf8",
      );
      await assert.rejects(
        emitRegistry({ paths }),
        isAdapterError("invalid_manifest"),
      );
      assert.equal(await readFile(paths.manifestPath, "utf8"), original);
      assert.equal(
        await readFile(path.join(paths.stageRoot, "sentinel.txt"), "utf8"),
        "old",
      );
    }
  });

  test("check rejects a non-deterministic build and leaves public output alone", async () => {
    const paths = await createTestPaths();
    await mkdir(paths.publicRoot, { recursive: true });
    await writeFile(path.join(paths.publicRoot, "sentinel.txt"), "old", "utf8");
    await runRegistryCommand("check", {
      paths,
      shadcnBuild: writeFakeShadcnOutput,
      hostTypecheck: async () => {},
    });
    await assert.rejects(
      runRegistryCommand("check", {
        paths,
        shadcnBuild: writeFakeShadcnOutput,
        hostTypecheck: async () => {
          throw new Error("host types failed");
        },
      }),
      /host types failed/,
    );
    let builds = 0;
    await assert.rejects(
      runRegistryCommand("check", {
        paths,
        shadcnBuild: async (options) => {
          await writeFakeShadcnOutput(options);
          builds += 1;
          if (builds !== 2) return;
          const itemPath = path.join(options.outputRoot, "like-dislike.json");
          const item: unknown = JSON.parse(await readFile(itemPath, "utf8"));
          await writeFile(itemPath, JSON.stringify(item), "utf8");
        },
        hostTypecheck: async () => {},
      }),
      isAdapterError("output_drift"),
    );
    assert.equal(
      await readFile(path.join(paths.publicRoot, "sentinel.txt"), "utf8"),
      "old",
    );
  });

  test("build atomically replaces public output only after validation", async () => {
    const paths = await createTestPaths();
    await mkdir(paths.publicRoot, { recursive: true });
    await writeFile(path.join(paths.publicRoot, "sentinel.txt"), "old", "utf8");

    await runRegistryCommand("build", {
      paths,
      shadcnBuild: writeFakeShadcnOutput,
      hostTypecheck: async () => {},
    });

    await assert.rejects(
      readFile(path.join(paths.publicRoot, "sentinel.txt"), "utf8"),
    );
    const item = JSON.parse(
      await readFile(
        path.join(paths.publicRoot, "feedback-system.json"),
        "utf8",
      ),
    ) as { name: string };
    assert.equal(item.name, "feedback-system");
  });

  for (const [name, shadcnBuild, failure] of [
    [
      "the shadcn Adapter fails",
      async () => {
        throw new Error("shadcn failed");
      },
      /shadcn failed/,
    ],
    [
      "built output fails validation",
      async (options: Parameters<ShadcnBuildAdapter>[0]) => {
        await writeFakeShadcnOutput(options);
        await rm(path.join(options.outputRoot, "star-rating.json"));
      },
      isAdapterError("output_drift"),
    ],
  ] as const) {
    test(`preserves public output when ${name}`, async () => {
      const paths = await createTestPaths();
      await mkdir(paths.publicRoot, { recursive: true });
      await writeFile(
        path.join(paths.publicRoot, "sentinel.txt"),
        "old",
        "utf8",
      );
      await assert.rejects(
        runRegistryCommand("build", {
          paths,
          shadcnBuild,
          hostTypecheck: async () => {},
        }),
        failure,
      );
      assert.equal(
        await readFile(path.join(paths.publicRoot, "sentinel.txt"), "utf8"),
        "old",
      );
    });
  }

  test("rejects missing, extra, or changed built output", async () => {
    const cases: Array<{
      name: string;
      mutate: (outputRoot: string) => Promise<void>;
    }> = [
      {
        name: "extra file",
        mutate: (outputRoot) =>
          writeFile(path.join(outputRoot, "extra.json"), "{}", "utf8"),
      },
      {
        name: "missing file",
        mutate: (outputRoot) =>
          rm(path.join(outputRoot, "star-rating.json"), { force: true }),
      },
      {
        name: "changed content",
        mutate: async (outputRoot) => {
          const itemPath = path.join(outputRoot, "like-dislike.json");
          const item = JSON.parse(await readFile(itemPath, "utf8")) as {
            files: Array<{ content: string }>;
          };
          item.files[0]!.content = "export const drifted = true;\n";
          await writeFile(itemPath, JSON.stringify(item), "utf8");
        },
      },
      {
        name: "malformed dependencies",
        mutate: async (outputRoot) => {
          const itemPath = path.join(outputRoot, "emoji-feedback.json");
          const item = JSON.parse(await readFile(itemPath, "utf8")) as Record<
            string,
            unknown
          >;
          item.dependencies = "invalid";
          await writeFile(itemPath, JSON.stringify(item), "utf8");
        },
      },
    ];

    for (const testCase of cases) {
      const paths = await createTestPaths();
      const badBuild: ShadcnBuildAdapter = async (options) => {
        await writeFakeShadcnOutput(options);
        await testCase.mutate(options.outputRoot);
      };

      await assert.rejects(
        runRegistryCommand("check", {
          paths,
          shadcnBuild: badBuild,
          hostTypecheck: async () => {},
        }),
        isAdapterError("output_drift"),
        testCase.name,
      );
    }
  });

  test("leaves prior staging intact when canonical source is missing", async () => {
    const paths = await createTestPaths();
    const originalManifest = JSON.stringify({
      ...createExpectedRegistry(),
      homepage: "https://previous-site.test",
    });
    await writeFile(paths.manifestPath, originalManifest, "utf8");
    await mkdir(paths.stageRoot, { recursive: true });
    await writeFile(path.join(paths.stageRoot, "sentinel.txt"), "old", "utf8");
    const missingSourcePaths = {
      ...paths,
      sourceRoot: path.join(paths.registryRoot, "missing-source"),
    };

    await assert.rejects(
      emitRegistry({ paths: missingSourcePaths }),
      isAdapterError("missing_source"),
    );
    assert.equal(
      await readFile(path.join(paths.stageRoot, "sentinel.txt"), "utf8"),
      "old",
    );
    assert.equal(await readFile(paths.manifestPath, "utf8"), originalManifest);
  });
});

async function createTestPaths(): Promise<RegistryPaths> {
  const testRoot = await makeTemporaryRoot("sentimeter-adapter-");
  const registryRoot = path.join(testRoot, "apps", "registry");
  await mkdir(registryRoot, { recursive: true });
  await writeFile(
    path.join(registryRoot, "registry.json"),
    `${JSON.stringify(createExpectedRegistry(), null, 2)}\n`,
    "utf8",
  );

  const defaultPaths = createRegistryPaths(realRepoRoot);
  return {
    repoRoot: realRepoRoot,
    registryRoot,
    sourceRoot: defaultPaths.sourceRoot,
    manifestPath: path.join(registryRoot, "registry.json"),
    stageRoot: path.join(registryRoot, ".generated", "sentimeter"),
    publicRoot: path.join(registryRoot, "public", "r"),
    temporaryRoot: path.join(registryRoot, ".tmp"),
  };
}

async function writeFakeShadcnOutput(options: {
  registryRoot: string;
  manifestPath: string;
  outputRoot: string;
}): Promise<void> {
  const manifestText = await readFile(options.manifestPath, "utf8");
  const manifest = JSON.parse(manifestText) as ReturnType<
    typeof createExpectedRegistry
  >;
  await mkdir(options.outputRoot, { recursive: true });
  await writeFile(
    path.join(options.outputRoot, "registry.json"),
    manifestText,
    "utf8",
  );

  await Promise.all(
    manifest.items.map(async (item) => {
      const files = await Promise.all(
        item.files.map(async (file) => ({
          ...file,
          content: await readFile(
            path.join(options.registryRoot, file.path),
            "utf8",
          ),
        })),
      );
      await writeFile(
        path.join(options.outputRoot, `${item.name}.json`),
        `${JSON.stringify(
          {
            ...item,
            $schema: "https://ui.shadcn.com/schema/registry-item.json",
            files,
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
    }),
  );
}

async function makeTemporaryRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), prefix));
  temporaryRoots.push(root);
  return root;
}

function isAdapterError(code: RegistryAdapterError["code"]) {
  return (error: unknown): boolean =>
    error instanceof RegistryAdapterError && error.code === code;
}
