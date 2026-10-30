import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

import { listRepoFiles } from "./guard-utils";

const repoRoot = process.cwd();
const markdownLinkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

function listMarkdownFiles() {
  return listRepoFiles(repoRoot, ["*.md"]).map((file) => join(repoRoot, file));
}

function stripLinkTarget(rawTarget: string) {
  const withoutTitle = rawTarget.trim().split(/\s+["'][^"']*["']$/)[0] ?? "";
  return withoutTitle.replace(/^<|>$/g, "");
}

function isExternalTarget(target: string) {
  return (
    target.startsWith("http://") ||
    target.startsWith("https://") ||
    target.startsWith("mailto:") ||
    target.startsWith("#")
  );
}

const failures: string[] = [];

for (const file of listMarkdownFiles()) {
  const text = readFileSync(file, "utf8");
  const fileDir = dirname(file);

  for (const match of text.matchAll(markdownLinkPattern)) {
    const target = stripLinkTarget(match[1] ?? "");
    if (!target || isExternalTarget(target)) continue;

    const fileTarget = decodeURIComponent(target.split("#")[0] ?? "");
    if (!fileTarget) continue;

    const resolved = normalize(join(fileDir, fileTarget));
    if (!resolved.startsWith(repoRoot) || !existsSync(resolved)) {
      failures.push(`${file.replace(`${repoRoot}/`, "")} -> ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Markdown link check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Markdown links look usable.");
