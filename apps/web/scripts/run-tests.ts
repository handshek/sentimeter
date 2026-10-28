// Runs every apps/web test file. Suites that replace modules (mock.module) or
// boot a Convex test backend run in their own `bun test` process because their
// module state leaks into other files; everything else runs in one batch.
import { Glob } from "bun";

const isolationMarkers = ["mock.module(", "convex-test"];
const ignored = /(^|\/)(node_modules|\.next|_generated)\//;

const files = Array.from(
  new Glob("**/*{.,_}{test,spec}.{ts,tsx,js,jsx}").scanSync({ dot: false }),
)
  .filter((file) => !ignored.test(file))
  .sort();

const shared: string[] = [];
const isolated: string[] = [];
for (const file of files) {
  const source = await Bun.file(file).text();
  if (isolationMarkers.some((marker) => source.includes(marker))) {
    isolated.push(file);
  } else {
    shared.push(file);
  }
}

const runs = [shared, ...isolated.map((file) => [file])].filter(
  (run) => run.length > 0,
);

for (const run of runs) {
  const result = Bun.spawnSync(
    ["bun", "test", ...run.map((file) => `./${file}`)],
    { stdout: "inherit", stderr: "inherit" },
  );
  if (result.exitCode !== 0) process.exit(result.exitCode ?? 1);
}
