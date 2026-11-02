import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { listRepoFiles } from "./guard-utils";

export type FilenameFinding = {
  file: string;
  rule: "filename/convention";
  message: string;
};

export function inspectFilename(file: string): FilenameFinding | undefined {
  const normalized = file.replaceAll("\\", "/");
  if (
    !/\.[cm]?[jt]sx?$/.test(normalized) ||
    normalized.startsWith("apps/web/convex/_generated/") ||
    normalized.startsWith("apps/registry/.generated/") ||
    normalized === "apps/registry/worker-configuration.d.ts"
  ) {
    return;
  }

  const name = basename(normalized).replace(/\.[cm]?[jt]sx?$/, "");
  const stem = name.replace(/\.(?:config|test|d)$/, "");
  const convex = normalized.startsWith("apps/web/convex/");
  const convention = convex
    ? /^[a-z][a-zA-Z0-9]*$/
    : /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  const bracketedRoute =
    normalized.startsWith("apps/web/app/") &&
    /^\[(?:[a-zA-Z0-9]+|\.\.\.[a-zA-Z0-9]+|\[\.\.\.[a-zA-Z0-9]+\])\]$/.test(
      name,
    );
  const testName = /(?:[._-](?:test|spec))$/.test(name);
  if (
    (bracketedRoute || convention.test(stem)) &&
    (!testName || /\.test\.tsx?$/.test(normalized))
  ) {
    return;
  }

  return {
    file: normalized,
    rule: "filename/convention",
    message: `Use ${convex ? "camelCase" : "kebab-case"} module names and *.test.ts(x) tests.`,
  };
}

export function checkFilenames(repoRoot: string): FilenameFinding[] {
  return listRepoFiles(repoRoot).flatMap((file) => {
    const finding = inspectFilename(file);
    return finding ? [finding] : [];
  });
}

if (import.meta.main) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const findings = checkFilenames(repoRoot);
  for (const finding of findings) {
    console.error(`${finding.file} ${finding.rule}: ${finding.message}`);
  }
  if (findings.length) process.exitCode = 1;
  else console.log("Module filenames follow repository conventions.");
}
