import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type RegistryFile = {
  path?: unknown;
  content?: unknown;
  target?: unknown;
  type?: unknown;
};

type RegistryItem = {
  name?: unknown;
  type?: unknown;
  title?: unknown;
  description?: unknown;
  dependencies?: unknown;
  registryDependencies?: unknown;
  files?: unknown;
};

type Registry = {
  name?: unknown;
  items?: unknown;
};

const repoRoot = process.cwd();
const registryRoot = join(repoRoot, "apps", "registry");
const publicRoot = join(registryRoot, "public", "r");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function fail(message: string): never {
  console.error(`Registry check failed: ${message}`);
  process.exit(1);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

const sourceRegistry = readJson<Registry>(join(registryRoot, "registry.json"));
const generatedRegistry = readJson<Registry>(join(publicRoot, "registry.json"));

if (sourceRegistry.name !== "sentimeter") {
  fail("apps/registry/registry.json must be named sentimeter");
}

if (JSON.stringify(sourceRegistry) !== JSON.stringify(generatedRegistry)) {
  fail(
    "generated public/r/registry.json is out of sync; run bun run registry:build",
  );
}

if (!Array.isArray(sourceRegistry.items) || sourceRegistry.items.length === 0) {
  fail("registry has no items");
}

const itemNames = new Set<string>();

for (const item of sourceRegistry.items as RegistryItem[]) {
  if (typeof item.name !== "string" || item.name.length === 0) {
    fail("every registry item needs a name");
  }
  if (itemNames.has(item.name)) {
    fail(`duplicate registry item name: ${item.name}`);
  }
  itemNames.add(item.name);

  if (item.type !== "registry:block") {
    fail(`${item.name} must use type registry:block`);
  }
  if (typeof item.title !== "string" || typeof item.description !== "string") {
    fail(`${item.name} needs title and description`);
  }
  if (!Array.isArray(item.files) || item.files.length === 0) {
    fail(`${item.name} needs at least one file`);
  }

  for (const file of item.files as RegistryFile[]) {
    if (typeof file.path !== "string") {
      fail(`${item.name} has a file without a path`);
    }
    if (!existsSync(join(registryRoot, file.path))) {
      fail(`${item.name} source file is missing: ${file.path}`);
    }
    if (
      typeof file.target !== "string" ||
      !file.target.startsWith("components/sentimeter/")
    ) {
      fail(`${item.name} targets must install under components/sentimeter`);
    }
  }

  if (item.name !== "feedback-system") {
    if (!isStringArray(item.registryDependencies)) {
      fail(`${item.name} must depend on feedback-system by registry URL`);
    }
    for (const dependency of item.registryDependencies) {
      if (
        dependency !==
        "https://registry.handshek.workers.dev/r/feedback-system.json"
      ) {
        fail(
          `${item.name} has an unexpected registry dependency: ${dependency}`,
        );
      }
    }
  }

  const generatedItemPath = join(publicRoot, `${item.name}.json`);
  if (!existsSync(generatedItemPath)) {
    fail(`${item.name} generated JSON is missing; run bun run registry:build`);
  }

  const generatedItem = readJson<RegistryItem>(generatedItemPath);
  if (generatedItem.name !== item.name) {
    fail(`${item.name} generated JSON name does not match source`);
  }
  if (!Array.isArray(generatedItem.files) || generatedItem.files.length === 0) {
    fail(`${item.name} generated JSON has no files`);
  }
  for (const file of generatedItem.files as RegistryFile[]) {
    if (typeof file.content !== "string" || file.content.length === 0) {
      fail(`${item.name} generated file content is missing`);
    }
  }
}

console.log(`Registry looks usable (${itemNames.size} items).`);
