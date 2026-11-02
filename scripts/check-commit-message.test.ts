import { describe, expect, test } from "bun:test";
import { validCommitSubject } from "./check-commit-message";

describe("commit subject guard", () => {
  test.each([
    "feat",
    "fix",
    "refactor",
    "docs",
    "test",
    "build",
    "ci",
    "chore",
    "perf",
    "style",
  ])("accepts %s", (type) => {
    expect(validCommitSubject(`${type}(widgets): preserve feedback`)).toBe(
      true,
    );
  });
  test.each([
    'Merge branch "master"',
    'Revert "fix(widgets): preserve feedback"',
    "revert: fix(widgets): preserve feedback",
  ])("accepts merge/revert subjects: %s", (subject) => {
    expect(validCommitSubject(subject)).toBe(true);
  });
  test.each([
    "fix: no scope",
    "fix(): no scope",
    "update(repo): unsupported",
    "fix(repo): ",
    "fix(repo):missing space",
    "fix(repo): one\ntwo",
  ])("rejects malformed subjects: %s", (subject) => {
    expect(validCommitSubject(subject)).toBe(false);
  });
});
