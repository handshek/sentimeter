import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createExpectedRegistry,
  planRegistryArtifacts,
  RegistryAdapterError,
  SOURCE_MAPPINGS,
  validateManifest,
  type PlannedArtifact,
  type SourceMapping,
} from "./registry-plan";

type RegistryMode = "emit" | "check" | "build";

export type RegistryPaths = Readonly<{
  repoRoot: string;
  registryRoot: string;
  sourceRoot: string;
  manifestPath: string;
  stageRoot: string;
  publicRoot: string;
  temporaryRoot: string;
}>;

export type ShadcnBuildAdapter = (options: {
  registryRoot: string;
  manifestPath: string;
  outputRoot: string;
}) => Promise<void>;

export type HostTypecheckAdapter = (options: {
  repoRoot: string;
  fixtureRoot: string;
  tsconfigPath: string;
}) => Promise<void>;

type RegistryCommandOptions = Readonly<{
  paths?: RegistryPaths;
  mappings?: readonly SourceMapping[];
  shadcnBuild?: ShadcnBuildAdapter;
  hostTypecheck?: HostTypecheckAdapter;
}>;

type RegistryFile = Readonly<{
  path: string;
  type: string;
  target: string;
  content?: string;
}>;

type RegistryItem = Readonly<{
  name: string;
  type: string;
  title: string;
  description: string;
  dependencies?: readonly string[];
  registryDependencies?: readonly string[];
  files: readonly RegistryFile[];
}>;

const scriptsRoot = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptsRoot, "../../..");

export function createRegistryPaths(
  repoRoot: string = defaultRepoRoot,
): RegistryPaths {
  const registryRoot = path.join(repoRoot, "apps", "registry");
  return {
    repoRoot,
    registryRoot,
    sourceRoot: path.join(repoRoot, "packages", "widgets", "src"),
    manifestPath: path.join(registryRoot, "registry.json"),
    stageRoot: path.join(registryRoot, ".generated", "sentimeter"),
    publicRoot: path.join(registryRoot, "public", "r"),
    temporaryRoot: path.join(registryRoot, ".tmp"),
  };
}

export async function runRegistryCommand(
  mode: RegistryMode,
  options: RegistryCommandOptions = {},
): Promise<void> {
  const paths = options.paths ?? createRegistryPaths();
  const mappings = options.mappings ?? SOURCE_MAPPINGS;
  const artifacts = await emitRegistry({ paths, mappings });

  if (mode === "emit") return;

  const shadcnBuild = options.shadcnBuild ?? runLocalShadcnBuild;
  const hostTypecheck = options.hostTypecheck ?? runLocalHostTypecheck;

  await withTemporaryDirectory(
    paths.temporaryRoot,
    "registry-output-",
    async (outputRoot) => {
      await shadcnBuild({
        registryRoot: paths.registryRoot,
        manifestPath: paths.manifestPath,
        outputRoot,
      });
      await validateBuiltOutput({ outputRoot, paths, mappings, artifacts });
      await validateHostFixture({ outputRoot, paths, hostTypecheck });

      if (mode === "check") {
        await withTemporaryDirectory(
          paths.temporaryRoot,
          "registry-repeat-",
          async (repeatRoot) => {
            await shadcnBuild({
              registryRoot: paths.registryRoot,
              manifestPath: paths.manifestPath,
              outputRoot: repeatRoot,
            });
            await validateBuiltOutput({
              outputRoot: repeatRoot,
              paths,
              mappings,
              artifacts,
            });
            await assertDirectoriesEqual(
              outputRoot,
              repeatRoot,
              "shadcn output is not deterministic",
            );
          },
        );
        return;
      }

      await replaceDirectoryAtomically(
        paths.publicRoot,
        async (preparedRoot) => {
          await copyDirectoryContents(outputRoot, preparedRoot);
          await assertDirectoriesEqual(
            outputRoot,
            preparedRoot,
            "prepared public registry differs from validated output",
          );
        },
      );
    },
  );
}

export async function emitRegistry(options: {
  paths: RegistryPaths;
  mappings?: readonly SourceMapping[];
}): Promise<readonly PlannedArtifact[]> {
  const mappings = options.mappings ?? SOURCE_MAPPINGS;
  const manifest = await readJson(options.paths.manifestPath);
  validateManifest(manifest, mappings);

  const artifacts = await planRegistryArtifacts({
    sourceRoot: options.paths.sourceRoot,
    mappings,
  });

  await replaceDirectoryAtomically(
    options.paths.stageRoot,
    async (preparedRoot) => {
      await Promise.all(
        artifacts.map(async (artifact) => {
          const outputPath = path.join(preparedRoot, artifact.staged);
          await mkdir(path.dirname(outputPath), { recursive: true });
          await writeFile(outputPath, artifact.content, "utf8");
        }),
      );
      await validateStagedOutput(preparedRoot, artifacts);
    },
  );

  return artifacts;
}

export async function validateBuiltOutput(options: {
  outputRoot: string;
  paths: RegistryPaths;
  mappings?: readonly SourceMapping[];
  artifacts: readonly PlannedArtifact[];
}): Promise<void> {
  const mappings = options.mappings ?? SOURCE_MAPPINGS;
  const expectedRegistry = createExpectedRegistry(mappings);
  const expectedOutputFiles = [
    "registry.json",
    ...expectedRegistry.items.map((item) => `${item.name}.json`),
  ].sort();
  const actualOutputFiles = await listFiles(options.outputRoot);
  assertExactList(
    actualOutputFiles,
    expectedOutputFiles,
    "built Registry Item files",
  );

  const builtRegistry = await readJson(
    path.join(options.outputRoot, "registry.json"),
  );
  validateManifest(builtRegistry, mappings);

  const artifactByStagedPath = new Map(
    options.artifacts.map((artifact) => [
      `.generated/sentimeter/${artifact.staged}`,
      artifact,
    ]),
  );

  for (const expectedItem of expectedRegistry.items) {
    const builtItem = parseRegistryItem(
      await readJson(
        path.join(options.outputRoot, `${expectedItem.name}.json`),
      ),
      expectedItem.name,
    );

    assertItemMetadata(builtItem, expectedItem);
    assertExactList(
      builtItem.files.map((file) => file.path),
      expectedItem.files.map((file) => file.path),
      `${expectedItem.name} file paths`,
    );

    for (const expectedFile of expectedItem.files) {
      const builtFile = builtItem.files.find(
        (file) => file.path === expectedFile.path,
      );
      if (!builtFile) {
        failOutput(`${expectedItem.name} is missing ${expectedFile.path}`);
      }
      if (
        builtFile.type !== expectedFile.type ||
        builtFile.target !== expectedFile.target
      ) {
        failOutput(
          `${expectedItem.name} metadata drifted for ${expectedFile.path}`,
        );
      }

      const artifact = artifactByStagedPath.get(expectedFile.path);
      if (!artifact || builtFile.content !== artifact.content) {
        failOutput(
          `${expectedItem.name} content drifted for ${expectedFile.path}`,
        );
      }
      assertNoForbiddenImports(
        builtFile.content,
        `${expectedItem.name}:${expectedFile.path}`,
      );
    }
  }
}

export async function replaceDirectoryAtomically(
  targetRoot: string,
  prepare: (preparedRoot: string) => Promise<void>,
): Promise<void> {
  const parentRoot = path.dirname(targetRoot);
  const targetName = path.basename(targetRoot);
  await mkdir(parentRoot, { recursive: true });
  const preparedRoot = await mkdtemp(
    path.join(parentRoot, `.${targetName}.next-`),
  );
  const backupRoot = path.join(
    parentRoot,
    `.${targetName}.previous-${randomUUID()}`,
  );
  let hasBackup = false;

  try {
    await prepare(preparedRoot);

    if (await pathExists(targetRoot)) {
      await rename(targetRoot, backupRoot);
      hasBackup = true;
    }

    try {
      await rename(preparedRoot, targetRoot);
    } catch (error) {
      if (hasBackup && !(await pathExists(targetRoot))) {
        await rename(backupRoot, targetRoot);
        hasBackup = false;
      }
      throw error;
    }

    if (hasBackup) {
      hasBackup = false;
      await rm(backupRoot, { recursive: true, force: true }).catch(() => {});
    }
  } finally {
    await rm(preparedRoot, { recursive: true, force: true });
    if (hasBackup && (await pathExists(targetRoot))) {
      await rm(backupRoot, { recursive: true, force: true });
    }
  }
}

async function validateStagedOutput(
  stageRoot: string,
  artifacts: readonly PlannedArtifact[],
): Promise<void> {
  assertExactList(
    await listFiles(stageRoot),
    artifacts.map((artifact) => artifact.staged).sort(),
    "staged Registry Item files",
  );

  await Promise.all(
    artifacts.map(async (artifact) => {
      const content = await readFile(
        path.join(stageRoot, artifact.staged),
        "utf8",
      );
      if (content !== artifact.content) {
        failOutput(`staged content drifted for ${artifact.staged}`);
      }
      assertNoForbiddenImports(content, artifact.staged);
    }),
  );
}

async function validateHostFixture(options: {
  outputRoot: string;
  paths: RegistryPaths;
  hostTypecheck: HostTypecheckAdapter;
}): Promise<void> {
  await withTemporaryDirectory(
    options.paths.temporaryRoot,
    "registry-host-",
    async (fixtureRoot) => {
      const outputFiles = await listFiles(options.outputRoot);
      const itemFiles = outputFiles.filter((file) => file !== "registry.json");
      const installedTargets = new Map<string, string>();

      for (const itemFile of itemFiles) {
        const item = parseRegistryItem(
          await readJson(path.join(options.outputRoot, itemFile)),
          itemFile,
        );
        for (const file of item.files) {
          if (!file.content) failOutput(`${item.name} has empty file content`);
          const previous = installedTargets.get(file.target);
          if (previous !== undefined && previous !== file.content) {
            failOutput(`conflicting host target ${file.target}`);
          }
          installedTargets.set(file.target, file.content);
        }
      }

      await Promise.all(
        [...installedTargets].map(async ([target, content]) => {
          const outputPath = path.join(fixtureRoot, target);
          await mkdir(path.dirname(outputPath), { recursive: true });
          await writeFile(outputPath, content, "utf8");
        }),
      );

      const tsconfigPath = path.join(fixtureRoot, "tsconfig.json");
      const uiRoot = path.join(options.paths.repoRoot, "packages", "ui", "src");
      const widgetDependenciesRoot = path.join(
        options.paths.repoRoot,
        "packages",
        "widgets",
        "node_modules",
      );
      await writeFile(
        tsconfigPath,
        `${JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              module: "ESNext",
              moduleResolution: "Bundler",
              jsx: "react-jsx",
              strict: true,
              noEmit: true,
              skipLibCheck: true,
              lib: ["ES2022", "DOM", "DOM.Iterable"],
              baseUrl: fixtureRoot,
              typeRoots: [path.join(widgetDependenciesRoot, "@types")],
              types: ["react"],
              paths: {
                react: [
                  path.join(
                    widgetDependenciesRoot,
                    "@types",
                    "react",
                    "index.d.ts",
                  ),
                ],
                "react/jsx-runtime": [
                  path.join(
                    widgetDependenciesRoot,
                    "@types",
                    "react",
                    "jsx-runtime.d.ts",
                  ),
                ],
                "react/jsx-dev-runtime": [
                  path.join(
                    widgetDependenciesRoot,
                    "@types",
                    "react",
                    "jsx-dev-runtime.d.ts",
                  ),
                ],
                "lucide-react": [
                  path.join(
                    widgetDependenciesRoot,
                    "lucide-react",
                    "dist",
                    "lucide-react.d.ts",
                  ),
                ],
                "@/components/ui/button": [
                  path.join(uiRoot, "components", "button.tsx"),
                ],
                "@/components/ui/textarea": [
                  path.join(uiRoot, "components", "textarea.tsx"),
                ],
                "@/lib/utils": [path.join(uiRoot, "lib", "utils.ts")],
                "@workspace/ui/lib/utils": [
                  path.join(uiRoot, "lib", "utils.ts"),
                ],
              },
            },
            include: ["components/**/*.ts", "components/**/*.tsx"],
          },
          null,
          2,
        )}\n`,
        "utf8",
      );

      await options.hostTypecheck({
        repoRoot: options.paths.repoRoot,
        fixtureRoot,
        tsconfigPath,
      });
    },
  );
}

async function runLocalShadcnBuild(options: {
  registryRoot: string;
  manifestPath: string;
  outputRoot: string;
}): Promise<void> {
  const executable = path.join(
    options.registryRoot,
    "node_modules",
    ".bin",
    "shadcn",
  );
  await execute(
    executable,
    [
      "build",
      options.manifestPath,
      "--output",
      options.outputRoot,
      "--cwd",
      options.registryRoot,
    ],
    options.registryRoot,
    "shadcn build",
  );
}

async function runLocalHostTypecheck(options: {
  repoRoot: string;
  tsconfigPath: string;
}): Promise<void> {
  const executable = path.join(options.repoRoot, "node_modules", ".bin", "tsc");
  await execute(
    executable,
    ["--project", options.tsconfigPath, "--pretty", "false"],
    options.repoRoot,
    "temporary host type-check",
  );
}

async function execute(
  executable: string,
  arguments_: readonly string[],
  cwd: string,
  label: string,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    execFile(
      executable,
      [...arguments_],
      { cwd, env: { ...process.env, CI: "1" }, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (!error) {
          resolve();
          return;
        }
        const details = [stdout, stderr]
          .map((value) => value.trim())
          .filter(Boolean)
          .join("\n");
        reject(
          new RegistryAdapterError(
            "command_failed",
            `${label} failed${details ? `:\n${details}` : "."}`,
          ),
        );
      },
    );
  });
}

async function withTemporaryDirectory<T>(
  temporaryRoot: string,
  prefix: string,
  callback: (directory: string) => Promise<T>,
): Promise<T> {
  await mkdir(temporaryRoot, { recursive: true });
  const directory = await mkdtemp(path.join(temporaryRoot, prefix));
  try {
    return await callback(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function copyDirectoryContents(
  sourceRoot: string,
  targetRoot: string,
): Promise<void> {
  const entries = await readdir(sourceRoot);
  await Promise.all(
    entries.map((entry) =>
      cp(path.join(sourceRoot, entry), path.join(targetRoot, entry), {
        recursive: true,
      }),
    ),
  );
}

async function assertDirectoriesEqual(
  firstRoot: string,
  secondRoot: string,
  message: string,
): Promise<void> {
  const [firstFiles, secondFiles] = await Promise.all([
    listFiles(firstRoot),
    listFiles(secondRoot),
  ]);
  if (JSON.stringify(firstFiles) !== JSON.stringify(secondFiles)) {
    failOutput(message);
  }
  const contentsMatch = await Promise.all(
    firstFiles.map(async (file) => {
      const [first, second] = await Promise.all([
        readFile(path.join(firstRoot, file), "utf8"),
        readFile(path.join(secondRoot, file), "utf8"),
      ]);
      return first === second;
    }),
  );
  if (contentsMatch.some((matches) => !matches)) failOutput(message);
}

async function listFiles(root: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(path.join(root, prefix), {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.posix.join(prefix, entry.name);
      if (entry.isDirectory()) return await listFiles(root, relativePath);
      if (!entry.isFile())
        failOutput(`unexpected non-file output ${relativePath}`);
      return [relativePath];
    }),
  );
  return files.flat().sort();
}

function assertItemMetadata(
  actual: RegistryItem,
  expected: RegistryItem,
): void {
  const actualMetadata = {
    name: actual.name,
    type: actual.type,
    title: actual.title,
    description: actual.description,
    dependencies: actual.dependencies,
    registryDependencies: actual.registryDependencies,
  };
  const expectedMetadata = {
    name: expected.name,
    type: expected.type,
    title: expected.title,
    description: expected.description,
    dependencies: expected.dependencies,
    registryDependencies: expected.registryDependencies,
  };
  if (JSON.stringify(actualMetadata) !== JSON.stringify(expectedMetadata)) {
    failOutput(`${expected.name} metadata does not match registry.json`);
  }
}

function parseRegistryItem(value: unknown, label: string): RegistryItem {
  if (!isRecord(value) || !Array.isArray(value.files)) {
    failOutput(`${label} is not a valid Registry Item`);
  }
  if (
    (value.dependencies !== undefined && !isStringArray(value.dependencies)) ||
    (value.registryDependencies !== undefined &&
      !isStringArray(value.registryDependencies))
  ) {
    failOutput(`${label} contains invalid dependency metadata`);
  }
  const files = value.files.map((file) => {
    if (
      !isRecord(file) ||
      typeof file.path !== "string" ||
      typeof file.type !== "string" ||
      typeof file.target !== "string" ||
      (file.content !== undefined && typeof file.content !== "string")
    ) {
      failOutput(`${label} contains invalid file metadata`);
    }
    return {
      path: file.path,
      type: file.type,
      target: file.target,
      ...(typeof file.content === "string" ? { content: file.content } : {}),
    };
  });
  if (
    typeof value.name !== "string" ||
    typeof value.type !== "string" ||
    typeof value.title !== "string" ||
    typeof value.description !== "string"
  ) {
    failOutput(`${label} contains invalid Registry Item metadata`);
  }
  return {
    name: value.name,
    type: value.type,
    title: value.title,
    description: value.description,
    ...(isStringArray(value.dependencies)
      ? { dependencies: value.dependencies }
      : {}),
    ...(isStringArray(value.registryDependencies)
      ? { registryDependencies: value.registryDependencies }
      : {}),
    files,
  };
}

function assertExactList(
  actual: readonly string[],
  expected: readonly string[],
  label: string,
): void {
  if (
    JSON.stringify([...actual].sort()) !== JSON.stringify([...expected].sort())
  ) {
    failOutput(`${label} are missing, extra, or reordered unexpectedly`);
  }
}

function assertNoForbiddenImports(content: string, label: string): void {
  if (content.includes("@repo/") || content.includes("@workspace/")) {
    failOutput(`${label} contains a forbidden workspace import`);
  }
}

async function readJson(filePath: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as unknown;
  } catch (error) {
    throw new RegistryAdapterError(
      "output_drift",
      `Could not read JSON at ${filePath}: ${errorMessage(error)}`,
    );
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function failOutput(message: string): never {
  throw new RegistryAdapterError("output_drift", message);
}
