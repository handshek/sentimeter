import { readFileSync } from "node:fs";

export function validCommitSubject(subject: string): boolean {
  return /^(?:(?:feat|fix|refactor|docs|test|build|ci|chore|perf|style)\([a-z0-9][a-z0-9/-]*\): \S.*|Merge .+|Revert ".+"|revert: .+)$/.test(
    subject,
  );
}

if (import.meta.main) {
  const [argument, title] = process.argv.slice(2);
  const subject =
    argument === "--title"
      ? (title ?? "")
      : argument
        ? (readFileSync(argument, "utf8").split(/\r?\n/)[0] ?? "")
        : "";
  if (!validCommitSubject(subject)) {
    console.error(
      "Expected type(scope): summary (feat, fix, refactor, docs, test, build, ci, chore, perf, style), or a merge/revert commit.",
    );
    process.exitCode = 1;
  }
}
