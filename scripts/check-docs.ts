import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { listRepoFiles } from "./guard-utils";

type DocsFinding = { file: string; line: number; message: string };

// Build outputs and local skills need not exist in a fresh checkout.
const generatedPaths = new Set([
  ".agents/skills",
  "apps/registry/.generated",
  "apps/registry/public/r",
  "apps/registry/worker-configuration.d.ts",
]);
const hostPaths = new Set([
  "feedback-system/design-system.ts",
  "feedback-system/index.ts",
  "./feedback-system",
  "components.json",
]);

function readScripts(path: string): string[] {
  if (!existsSync(path)) return [];
  const manifest = JSON.parse(readFileSync(path, "utf8")) as {
    scripts?: Record<string, string>;
  };
  return Object.keys(manifest.scripts ?? {});
}

function isWithinRepo(repoRoot: string, path: string) {
  return path === repoRoot || path.startsWith(`${repoRoot}${sep}`);
}

function codeRegions(source: string) {
  const regions: { text: string; index: number; inline: boolean }[] = [];
  let fence: { delimiter: string; index: number } | undefined;
  let index = 0;
  for (const line of source.split(/(?<=\n)/)) {
    const delimiter = /^[ \t]*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (
        delimiter &&
        delimiter[0] === fence.delimiter[0] &&
        delimiter.length >= fence.delimiter.length &&
        /^[ \t]*(?:`+|~+)[ \t]*\r?\n?$/.test(line)
      ) {
        regions.push({
          text: source.slice(fence.index, index),
          index: fence.index,
          inline: false,
        });
        fence = undefined;
      }
    } else if (delimiter) {
      fence = { delimiter, index: index + line.length };
    } else {
      for (const match of line.matchAll(/(`+)(.+?)\1/g)) {
        regions.push({
          text: match[2] ?? "",
          index: index + match.index + (match[1]?.length ?? 0),
          inline: true,
        });
      }
    }
    index += line.length;
  }
  if (fence)
    regions.push({
      text: source.slice(fence.index),
      index: fence.index,
      inline: false,
    });
  return regions;
}

function nearbyScripts(repoRoot: string, directory: string) {
  let current = directory;
  while (isWithinRepo(repoRoot, current)) {
    const manifest = join(current, "package.json");
    if (existsSync(manifest))
      return new Set([
        ...readScripts(join(repoRoot, "package.json")),
        ...readScripts(manifest),
      ]);
    if (current === repoRoot) break;
    current = dirname(current);
  }
  return new Set<string>();
}

function isFileTarget(value: string) {
  return value.includes("/") || /\.[cm]?[jt]sx?$/.test(value);
}

export function inspectDocs(
  file: string,
  source: string,
  repoRoot: string,
): DocsFinding[] {
  const findings: DocsFinding[] = [];
  const fileDir = dirname(resolve(repoRoot, file));
  function report(index: number, message: string) {
    findings.push({
      file,
      line: source.slice(0, index).split("\n").length,
      message,
    });
  }

  for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = (match[1] ?? "")
      .trim()
      .replace(/\s+["'][^"']*["']$/, "")
      .replace(/^<|>$/g, "");
    if (!target || /^(?:https?:|mailto:|#)/.test(target)) continue;
    const path = decodeURIComponent(target.split("#")[0] ?? "");
    if (!path) continue;
    const resolved = resolve(fileDir, path);
    if (!isWithinRepo(repoRoot, resolved) || !existsSync(resolved))
      report(match.index, `Missing Markdown target: ${target}`);
  }

  if (!["AGENTS.md", "CONTRIBUTING.md", "README.md"].includes(basename(file)))
    return findings;

  for (const region of codeRegions(source)) {
    for (const match of region.text.matchAll(
      /\bbun[ \t]+run[ \t]+([^\r\n;&|`]+)/g,
    )) {
      const args = [
        ...(match[1] ?? "").matchAll(/"([^"]*)"|'([^']*)'|([^\s]+)/g),
      ].map((arg) => arg[1] ?? arg[2] ?? arg[3] ?? "");
      let commandDir = fileDir;
      let target: string | undefined;
      for (let index = 0; index < args.length; index++) {
        const arg = args[index] ?? "";
        if (arg === "--cwd" || arg.startsWith("--cwd=")) {
          const cwd = arg === "--cwd" ? args[++index] : arg.slice(6);
          commandDir = resolve(repoRoot, cwd ?? "");
        } else if (arg === "--filter") {
          index++;
        } else if (arg === "--" || !arg.startsWith("-")) {
          target = arg === "--" ? args[index + 1] : arg;
          break;
        }
      }
      if (!target || /[*?{}<>]/.test(target)) continue;
      const commandIndex = region.index + match.index;
      if (!isWithinRepo(repoRoot, commandDir)) {
        report(
          commandIndex,
          "Bun working directory is outside the repository.",
        );
        continue;
      }
      if (nearbyScripts(repoRoot, commandDir).has(target)) continue;
      if (isFileTarget(target)) {
        if (
          ![commandDir, repoRoot].some((directory) => {
            const path = resolve(directory, target);
            return isWithinRepo(repoRoot, path) && existsSync(path);
          })
        )
          report(commandIndex, `Missing bun target: ${target}`);
      } else report(commandIndex, `Unknown bun script: ${target}`);
    }

    if (!region.inline) continue;
    const rawPath = region.text;
    const path = rawPath.replace(/:\d+(?::\d+)?$/, "");
    if (
      /[\s*?{}<>|]/.test(path) ||
      path.startsWith("@") ||
      path.startsWith("/") ||
      /^[a-z][a-z0-9+.-]*:\/\//i.test(path) ||
      /^(?:[\w-]+\.)+[a-z]{2,}(?::\d+)?\//i.test(path) ||
      hostPaths.has(path) ||
      !(
        /^(?:\.?\.?\/)?[\w.-]+\//.test(path) ||
        /\.(?:[cm]?[jt]sx?|json|md)$/.test(path)
      )
    )
      continue;
    if (
      ![repoRoot, fileDir].some((directory) => {
        const resolved = resolve(directory, path);
        return (
          isWithinRepo(repoRoot, resolved) &&
          (generatedPaths.has(
            relative(repoRoot, resolved).replaceAll("\\", "/"),
          ) ||
            existsSync(resolved))
        );
      })
    )
      report(region.index, `Missing repo path: ${rawPath}`);
  }

  if (file === "AGENTS.md") {
    const table = new Set(
      [...source.matchAll(/^\|\s*`bun run ([\w:-]+)`\s*\|/gm)].map(
        (match) => match[1],
      ),
    );
    for (const script of readScripts(join(repoRoot, "package.json"))) {
      if (!table.has(script))
        report(0, `Root script missing from command table: ${script}`);
    }
  }
  return findings;
}

export function checkDocs(repoRoot: string): DocsFinding[] {
  return listRepoFiles(repoRoot, ["*.md"]).flatMap((file) =>
    inspectDocs(file, readFileSync(join(repoRoot, file), "utf8"), repoRoot),
  );
}

if (import.meta.main) {
  const repoRoot = resolve(process.cwd());
  const findings = checkDocs(repoRoot);
  for (const finding of findings)
    console.error(
      `${relative(repoRoot, resolve(repoRoot, finding.file))}:${finding.line} ${finding.message}`,
    );
  if (findings.length) {
    console.error(
      `Documentation check failed with ${findings.length} finding(s).`,
    );
    process.exitCode = 1;
  } else console.log("Documentation paths, commands, and links pass.");
}
