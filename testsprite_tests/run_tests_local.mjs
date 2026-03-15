#!/usr/bin/env node
/**
 * Run existing TestSprite-generated Playwright tests locally.
 * Requires: Python 3 with playwright installed (pip install -r requirements.txt && playwright install chromium)
 * Env: TEST_USER_EMAIL, TEST_USER_PASSWORD for tests that sign in.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDir = path.join(__dirname);
const files = fs
  .readdirSync(testsDir)
  .filter((f) => /^TC\d+_.*\.py$/.test(f))
  .sort();

if (files.length === 0) {
  console.error("No TC*.py files found in", testsDir);
  process.exit(1);
}

console.log(`Running ${files.length} test(s)...\n`);
let failed = 0;
for (const file of files) {
  const p = path.join(testsDir, file);
  console.log(`▶ ${file}`);
  const result = spawn("python3", [p], {
    cwd: testsDir,
    stdio: "inherit",
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });
  const code = await new Promise((resolve) => result.on("close", resolve));
  if (code !== 0) {
    failed++;
    console.log(`  ❌ exit ${code}\n`);
  } else {
    console.log(`  ✓\n`);
  }
}
console.log(`Done. ${files.length - failed}/${files.length} passed.`);
process.exit(failed > 0 ? 1 : 0);
