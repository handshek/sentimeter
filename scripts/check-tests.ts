import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// apps/web runs its suites in separate `bun test` processes because module
// mocks leak between files, so each test file must be named in the script.
const webRoot = join(process.cwd(), "apps/web");
const ignoredDirs = new Set([".next", "node_modules", "_generated"]);
// Every file name `bun test` picks up: *.test.*, *_test.*, *.spec.*, *_spec.*
const testFilePattern = /[._](test|spec)\.[jt]sx?$/;

function walkTestFiles(dir: string, files: string[] = []) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;

    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walkTestFiles(path, files);
    } else if (testFilePattern.test(entry)) {
      files.push(relative(webRoot, path));
    }
  }
  return files;
}

const packageJson = JSON.parse(
  readFileSync(join(webRoot, "package.json"), "utf8"),
) as { scripts?: { test?: string } };
const testTargets = (packageJson.scripts?.test ?? "")
  .split(/\s+/)
  .filter((part) => part && !part.startsWith("-") && part !== "bun")
  .filter((part) => part !== "test" && part !== "&&");

const unlisted = walkTestFiles(webRoot).filter(
  (file) =>
    !testTargets.some(
      (target) => file === target || file.startsWith(`${target}/`),
    ),
);

if (unlisted.length > 0) {
  console.error("Test files missing from apps/web `test` script:");
  for (const file of unlisted) {
    console.error(`- apps/web/${file}`);
  }
  process.exit(1);
}

console.log("Every apps/web test file is run by its test script.");
