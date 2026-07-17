import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type EnvMap = Record<string, string | undefined>;

const repoRoot = process.cwd();
const envPath = join(repoRoot, "apps", "web", ".env.local");

function parseEnvFile(path: string): EnvMap {
  if (!existsSync(path)) return {};

  const env: EnvMap = {};
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

function getEnv(name: string, fileEnv: EnvMap) {
  return process.env[name] ?? fileEnv[name];
}

function isUrl(value: string | undefined) {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const fileEnv = parseEnvFile(envPath);
const required = [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CONVEX_SITE_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
] as const;

const missing = required.filter((name) => !getEnv(name, fileEnv));
const invalidUrls = [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CONVEX_SITE_URL",
].filter((name) => {
  const value = getEnv(name, fileEnv);
  return value && !isUrl(value);
});

if (missing.length > 0 || invalidUrls.length > 0) {
  console.error("Sentimeter environment check failed.");
  if (!existsSync(envPath)) {
    console.error(`- Missing ${envPath}`);
  }
  for (const name of missing) {
    console.error(`- Missing ${name}`);
  }
  for (const name of invalidUrls) {
    console.error(`- ${name} must be a valid URL`);
  }
  console.error("See README.md and docs/ops/runbook.md for setup notes.");
  process.exit(1);
}

console.log("Sentimeter environment looks usable.");
