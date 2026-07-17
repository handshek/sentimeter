import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const repoRoot = process.cwd();
const ignoredDirs = new Set([".git", ".next", "node_modules"]);
const markdownLinkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

function walkMarkdownFiles(dir: string, files: string[] = []) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry) || entry.endsWith("_tests")) continue;

    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walkMarkdownFiles(path, files);
    } else if (entry.endsWith(".md") && !path.includes("/.agents/skills/")) {
      files.push(path);
    } else if (entry === "SKILL.md" && path.includes("/.agents/skills/")) {
      files.push(path);
    }
  }
  return files;
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

for (const file of walkMarkdownFiles(repoRoot)) {
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
