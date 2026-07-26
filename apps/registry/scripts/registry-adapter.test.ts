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
  type HostTypecheckAdapter,
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

    assert.equal(artifacts.length, 15);
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

  test("checks deterministic output through injected build and host Adapters", async () => {
    const paths = await createTestPaths();
    await mkdir(paths.publicRoot, { recursive: true });
    await writeFile(path.join(paths.publicRoot, "sentinel.txt"), "old", "utf8");
    let buildCalls = 0;
    let typecheckCalls = 0;
    const shadcnBuild: ShadcnBuildAdapter = async (options) => {
      buildCalls += 1;
      await writeFakeShadcnOutput(options);
    };
    const hostTypecheck: HostTypecheckAdapter = async ({
      fixtureRoot,
      tsconfigPath,
    }) => {
      typecheckCalls += 1;
      assert.match(
        await readFile(
          path.join(
            fixtureRoot,
            "components",
            "sentimeter",
            "like-dislike.tsx",
          ),
          "utf8",
        ),
        /from "\.\/feedback-system"/,
      );
      assert.match(await readFile(tsconfigPath, "utf8"), /@\/lib\/utils/);
    };

    await runRegistryCommand("check", {
      paths,
      shadcnBuild,
      hostTypecheck,
    });

    assert.equal(buildCalls, 2);
    assert.equal(typecheckCalls, 1);
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

  test("preserves public output when the shadcn Adapter fails", async () => {
    const paths = await createTestPaths();
    await mkdir(paths.publicRoot, { recursive: true });
    await writeFile(path.join(paths.publicRoot, "sentinel.txt"), "old", "utf8");

    await assert.rejects(
      runRegistryCommand("build", {
        paths,
        shadcnBuild: async () => {
          throw new Error("shadcn failed");
        },
        hostTypecheck: async () => {},
      }),
      /shadcn failed/,
    );
    assert.equal(
      await readFile(path.join(paths.publicRoot, "sentinel.txt"), "utf8"),
      "old",
    );
  });

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
