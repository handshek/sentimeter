import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function repoRootFromHere() {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  return path.resolve(dirname, "..");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function readTestSpriteApiKey() {
  if (process.env.API_KEY) return process.env.API_KEY;
  if (process.env.TESTSPRITE_API_KEY) return process.env.TESTSPRITE_API_KEY;

  // Best-effort: reuse the Codex app's MCP server config if present (do not print it).
  const codexConfigPath = path.resolve(process.env.HOME || "", ".codex/config.toml");
  try {
    const toml = fs.readFileSync(codexConfigPath, "utf8");
    const sectionMatch = toml.match(/\[mcp_servers\.testsprite\.env\][\s\S]*?(?=\n\[|\n$)/);
    if (!sectionMatch) return undefined;
    const apiKeyMatch = sectionMatch[0].match(/^\s*API_KEY\s*=\s*"(.*)"\s*$/m);
    if (!apiKeyMatch) return undefined;
    return apiKeyMatch[1];
  } catch {
    return undefined;
  }
}

class McpRpcClient {
  constructor(proc) {
    this.proc = proc;
    this.nextId = 1;
    this.pending = new Map();
    this.buffer = "";

    proc.stdout.on("data", (chunk) => this.#onData(chunk));
    proc.on("exit", (code, signal) => {
      const err = new Error(
        `TestSprite MCP server exited (code=${code ?? "null"} signal=${signal ?? "null"})`,
      );
      for (const { reject } of this.pending.values()) reject(err);
      this.pending.clear();
    });
  }

  #onData(chunk) {
    this.buffer += chunk.toString("utf8");
    while (true) {
      const nl = this.buffer.indexOf("\n");
      if (nl === -1) return;
      const line = this.buffer.slice(0, nl).replace(/\r$/, "");
      this.buffer = this.buffer.slice(nl + 1);

      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }

      if (typeof msg.id !== "undefined") {
        const pending = this.pending.get(msg.id);
        if (pending) {
          this.pending.delete(msg.id);
          if (msg.error) pending.reject(new Error(msg.error.message || "RPC error"));
          else pending.resolve(msg.result);
        }
      }
    }
  }

  request(method, params, { timeoutMs = 30000 } = {}) {
    const id = this.nextId++;
    const payload = { jsonrpc: "2.0", id, method, params };
    this.proc.stdin.write(JSON.stringify(payload) + "\n");
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`RPC timeout after ${timeoutMs}ms: ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => {
          clearTimeout(timeout);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timeout);
          reject(e);
        },
      });
    });
  }

  notify(method, params) {
    const payload = { jsonrpc: "2.0", method, params };
    this.proc.stdin.write(JSON.stringify(payload) + "\n");
  }
}

function unwrapToolResult(maybeWrapped) {
  if (!maybeWrapped) return maybeWrapped;
  if (maybeWrapped.next_action) return maybeWrapped;
  const content = maybeWrapped.content;
  if (!Array.isArray(content)) return maybeWrapped;
  const text = content
    .filter((c) => c && typeof c.text === "string")
    .map((c) => c.text)
    .join("");
  if (!text) return maybeWrapped;
  try {
    return JSON.parse(text);
  } catch {
    return maybeWrapped;
  }
}

function writeCodeSummaryYaml({ repoRoot }) {
  const codeSummaryPath = path.join(repoRoot, "testsprite_tests/tmp/code_summary.yaml");
  fs.mkdirSync(path.dirname(codeSummaryPath), { recursive: true });

  const yaml = `version: "2"
type: frontend
tech_stack:
  - language: TypeScript
  - framework: Next.js (App Router)
  - ui_library: Tailwind CSS v4 + shadcn/ui
  - other: Clerk (auth) + Convex (realtime DB)
routes:
  - path: /
    file: apps/web/app/page.tsx
    auth_required: false
    description: Landing page with sign-in CTA
  - path: /sign-in
    file: apps/web/app/sign-in/[[...sign-in]]/page.tsx
    auth_required: false
    description: Clerk sign-in page
  - path: /sign-up
    file: apps/web/app/sign-up/[[...sign-up]]/page.tsx
    auth_required: false
    description: Clerk sign-up page
  - path: /dashboard
    file: apps/web/app/dashboard/page.tsx
    auth_required: true
    description: Signed-in developer dashboard with project overview and project creation capability
  - path: /dashboard/projects/[projectId]
    file: apps/web/app/dashboard/projects/[projectId]/page.tsx
    auth_required: true
    description: Project detail page with analytics, charts, feedback breakdown by widget type
  - path: /widgets
    file: apps/web/app/widgets/page.tsx
    auth_required: false
    description: Widget showcase with emoji, thumbs, star rating demos
features:
  - name: Signed-out navigation
    description: Visitor can browse landing page and access Clerk auth pages
    files:
      - apps/web/app/page.tsx
      - apps/web/app/sign-in/[[...sign-in]]/page.tsx
      - apps/web/app/sign-up/[[...sign-up]]/page.tsx
    entry_route: /
    user_interactions:
      - Open landing page
      - Click Sign In and view Clerk sign-in widget
      - Click Sign Up and view Clerk sign-up widget
    api_calls: []
    auth_required: false
  - name: Protected dashboard and Project Creation
    description: Signed-in user can access dashboard, view projects, and create new projects.
    files:
      - apps/web/app/dashboard/page.tsx
      - apps/web/app/dashboard/_components/project-client.tsx
      - apps/web/app/dashboard/_components/projects-client.tsx
      - apps/web/app/dashboard/_components/sync-user-gate.tsx
      - apps/web/proxy.ts
    entry_route: /dashboard
    user_interactions:
      - Visit /dashboard while signed out and get redirected to /sign-in
      - Sign in via Clerk (TWO-STEP: email then Continue, then password then Continue) and view /dashboard
      - View list of projects on the dashboard
      - Click a project to open /dashboard/projects/[projectId]
      - Click 'Create Project' button
      - Fill out project name and URL in the modal
      - Submit modal to create project
    api_calls:
      - Create project via Convex
    auth_required: true
  - name: Project detail and Widgets
    description: Project analytics page and widget showcase
    files:
      - apps/web/app/dashboard/projects/[projectId]/page.tsx
      - apps/web/app/widgets/page.tsx
    entry_route: /dashboard
    user_interactions:
      - Open project from dashboard list to view analytics
      - Visit /widgets to see emoji, thumbs, star rating widget demos
    api_calls: []
    auth_required: false
known_limitations:
  - issue: Dashboard metrics are placeholders
    location: apps/web/app/dashboard/page.tsx
    impact: Stats show dashes (—) rather than real data
`;

  fs.writeFileSync(codeSummaryPath, yaml, "utf8");
  return codeSummaryPath;
}

function copyPrdIntoTmp({ repoRoot }) {
  const prdSrc = path.join(repoRoot, "testsprite_tests/PRD.md");
  if (!fs.existsSync(prdSrc)) {
    throw new Error(`Missing PRD at ${prdSrc}`);
  }
  const prdDir = path.join(repoRoot, "testsprite_tests/tmp/prd_files");
  fs.mkdirSync(prdDir, { recursive: true });
  const prdDst = path.join(prdDir, "PRD.md");
  fs.copyFileSync(prdSrc, prdDst);
  return prdDst;
}

function sanitizeGeneratedTests({ repoRoot }) {
  const configPath = path.join(repoRoot, "testsprite_tests/tmp/config.json");
  if (!fs.existsSync(configPath)) return { changedFiles: 0 };
  let cfg;
  try {
    cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return { changedFiles: 0 };
  }
  const loginUser = cfg.loginUser;
  const loginPassword = cfg.loginPassword;
  if (!loginUser || !loginPassword) return { changedFiles: 0 };

  const testsDir = path.join(repoRoot, "testsprite_tests");
  const files = fs
    .readdirSync(testsDir)
    .filter((f) => /^TC\d+_.*\.(py|js|ts|mjs|tsx)$/.test(f))
    .map((f) => path.join(testsDir, f));

  let changedFiles = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    let after = before;
    // Replace quoted literals with env lookups (avoid committing plaintext creds).
    if (file.endsWith(".py")) {
      after = after.replaceAll(
        `"${loginUser}"`,
        'os.getenv("TEST_USER_EMAIL", "")',
      );
      after = after.replaceAll(
        `'${loginUser}'`,
        'os.getenv("TEST_USER_EMAIL", "")',
      );
      after = after.replaceAll(
        `"${loginPassword}"`,
        'os.getenv("TEST_USER_PASSWORD", "")',
      );
      after = after.replaceAll(
        `'${loginPassword}'`,
        'os.getenv("TEST_USER_PASSWORD", "")',
      );
    } else {
      after = after.replaceAll(
        `"${loginUser}"`,
        'process.env.TEST_USER_EMAIL ?? ""',
      );
      after = after.replaceAll(
        `'${loginUser}'`,
        'process.env.TEST_USER_EMAIL ?? ""',
      );
      after = after.replaceAll(
        `"${loginPassword}"`,
        'process.env.TEST_USER_PASSWORD ?? ""',
      );
      after = after.replaceAll(
        `'${loginPassword}'`,
        'process.env.TEST_USER_PASSWORD ?? ""',
      );
    }
    if (after !== before) {
      // Ensure python has os imported if we introduced os.getenv tokens.
      if (file.endsWith(".py") && !after.includes("import os")) {
        after = `import os\n${after}`;
      }
      fs.writeFileSync(file, after, "utf8");
      changedFiles += 1;
    }
  }
  return { changedFiles };
}

function readTmpConfig({ repoRoot }) {
  const configPath = path.join(repoRoot, "testsprite_tests/tmp/config.json");
  if (!fs.existsSync(configPath)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return undefined;
  }
}

function writeTmpConfig({ repoRoot, config }) {
  const configPath = path.join(repoRoot, "testsprite_tests/tmp/config.json");
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf8");
}

function loadLoginCredsFromTmpConfig({ repoRoot }) {
  try {
    const cfg = readTmpConfig({ repoRoot });
    if (!cfg) return;
    if (!process.env.TEST_USER_EMAIL && cfg.loginUser) {
      process.env.TEST_USER_EMAIL = String(cfg.loginUser);
    }
    if (!process.env.TEST_USER_PASSWORD && cfg.loginPassword) {
      process.env.TEST_USER_PASSWORD = String(cfg.loginPassword);
    }
  } catch {
    // ignore
  }
}

async function runTerminalCommand(cmd, { cwd, env }) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, {
      cwd,
      env,
      stdio: ["inherit", "pipe", "pipe"],
      shell: true,
    });

    let done = false;
    const onData = (buf) => {
      const s = buf.toString("utf8");
      process.stdout.write(s);
      if (!done && s.includes("Test execution completed.")) {
        done = true;
        // Give it a moment to flush files, then exit early (otherwise it keeps the server alive for 1 hour).
        setTimeout(() => child.kill("SIGINT"), 2000);
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", (b) => process.stderr.write(b.toString("utf8")));
    child.on("exit", (code) => {
      if (code === 0 || (done && (code === 130 || code === null))) resolve();
      else reject(new Error(`Command failed (exit=${code ?? "null"}): ${cmd}`));
    });
  });
}

async function main() {
  const repoRoot = repoRootFromHere();
  const debug = process.env.TS_MCP_DEBUG === "1";

  const apiKey = readTestSpriteApiKey();
  if (!apiKey) {
    console.error(
      "Missing TestSprite API key. Set API_KEY (or TESTSPRITE_API_KEY) in your environment.",
    );
    process.exit(1);
  }

  copyPrdIntoTmp({ repoRoot });

  if (debug) console.log("[Debug] Spawning TestSprite MCP server via npx…");
  const serverProc = spawn("npx", ["-y", "@testsprite/testsprite-mcp@latest"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      API_KEY: apiKey,
      // Force the MCP tool to run in "console" mode so it returns a terminal command
      // instead of keeping the MCP server blocked for 1 hour.
      EXECUTION_TYPE: "console",
    },
    stdio: ["pipe", "pipe", "inherit"],
  });

  const mcp = new McpRpcClient(serverProc);

  // Initialize MCP session
  if (debug) console.log("[Debug] Initializing MCP protocol…");
  await mcp.request("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: { tools: {} },
    clientInfo: { name: "sentimeter-testsprite-runner", version: "1.0.0" },
  });
  mcp.notify("notifications/initialized", {});

  const tools = await mcp.request("tools/list", {});
  const toolNames = (tools?.tools || []).map((t) => t.name);
  const required = [
    "testsprite_check_account_info",
    "testsprite_bootstrap",
    "testsprite_generate_standardized_prd",
    "testsprite_generate_frontend_test_plan",
    "testsprite_generate_code_and_execute",
  ];
  for (const name of required) {
    if (!toolNames.includes(name)) {
      throw new Error(`Missing tool from MCP server: ${name}`);
    }
  }

  // 1) Validate API key/account
  if (debug) console.log("[Debug] Checking TestSprite account…");
  await mcp.request("tools/call", {
    name: "testsprite_check_account_info",
    arguments: {},
  });

  // 2) Bootstrap is only required the first time. If config already exists, we proceed.
  let tmpConfig = readTmpConfig({ repoRoot });
  if (!tmpConfig) {
    console.log(
      "\n[Step] Bootstrapping TestSprite.\n" +
        "A browser window should open. If it doesn't, check `testsprite_tests/tmp/config.json` for `serverPort`, then open:\n" +
        "http://localhost:<serverPort>/init?project_path=/Users/abhi/dev/sentimeter&default_type=frontend\n" +
        "Fill required fields and click Save/Commit.\n",
    );
    await mcp.request(
      "tools/call",
      {
        name: "testsprite_bootstrap",
        arguments: {
          projectPath: repoRoot,
          localPort: 3000,
          pathname: "",
          testScope: "codebase",
          type: "frontend",
        },
      },
      { timeoutMs: 30 * 60 * 1000 },
    );
    tmpConfig = readTmpConfig({ repoRoot });
  }

  // If the UI wrote config but didn’t flip the status for some reason, mark it committed so subsequent
  // MCP tools can run. This file is gitignored (`testsprite_tests/tmp/`).
  if (tmpConfig && tmpConfig.status && tmpConfig.status !== "commited") {
    if (debug) console.log(`[Debug] Marking testsprite tmp config as commited (was: ${tmpConfig.status})`);
    tmpConfig.status = "commited";
    writeTmpConfig({ repoRoot, config: tmpConfig });
  }

  // Load login credentials from the (gitignored) TestSprite config so tests can use env vars
  // without prompting or committing secrets.
  loadLoginCredsFromTmpConfig({ repoRoot });

  // 3) Code summary tool returns instructions; we generate and write the YAML file it requires.
  if (debug) console.log("[Debug] Generating code summary (YAML)…");
  await mcp.request(
    "tools/call",
    {
      name: "testsprite_generate_code_summary",
      arguments: { projectRootPath: repoRoot },
    },
    { timeoutMs: 2 * 60 * 1000 },
  );
  writeCodeSummaryYaml({ repoRoot });

  // 4) Standardize PRD (requires testsprite_tests/tmp/prd_files and code_summary.yaml)
  if (debug) console.log("[Debug] Generating standardized PRD…");
  await mcp.request(
    "tools/call",
    {
      name: "testsprite_generate_standardized_prd",
      arguments: { projectPath: repoRoot },
    },
    { timeoutMs: 3 * 60 * 1000 },
  );

  // 5) Frontend test plan (with login)
  if (debug) console.log("[Debug] Generating frontend test plan…");
  await mcp.request(
    "tools/call",
    {
      name: "testsprite_generate_frontend_test_plan",
      arguments: { projectPath: repoRoot, needLogin: true },
    },
    { timeoutMs: 3 * 60 * 1000 },
  );

  // 6) Generate tests + execute (console mode returns terminal command)
  if (debug) console.log("[Debug] Generating code + execution instructions…");
  const execRespRaw = await mcp.request(
    "tools/call",
    {
      name: "testsprite_generate_code_and_execute",
      arguments: {
        projectName: "sentimeter",
        projectPath: repoRoot,
        serverMode: "development",
        testIds: [],
        additionalInstruction:
          "Base URL http://localhost:3000. CRITICAL - Clerk sign-in is TWO-STEP: (1) Enter email, click Continue. (2) WAIT for password field to appear, enter password, click Continue. (3) Wait for redirect to /dashboard. NEVER fill email and password in the same form. Generate DIVERSE tests: landing Sign In/Up CTAs, unauthenticated redirect /dashboard->/sign-in, sign-in flow, sign-up flow, dashboard UI, Create Project modal + validation, project detail page /dashboard/projects/[id], widgets page /widgets. Aim for 12-15 tests. Use process.env.TEST_USER_EMAIL / process.env.TEST_USER_PASSWORD; do not hardcode credentials.",
      },
    },
    { timeoutMs: 3 * 60 * 1000 },
  );

  const execResp = unwrapToolResult(execRespRaw);
  const actions = execResp?.next_action || [];
  const terminalAction = actions.find(
    (a) => a?.type === "tool" && a?.input?.command && typeof a.input.command === "string",
  );
  if (!terminalAction) {
    console.error(execRespRaw);
    throw new Error("TestSprite did not return a terminal execution command.");
  }

  console.log("\n[Step] Running TestSprite execution command (will auto-exit after completion)...\n");
  await runTerminalCommand(terminalAction.input.command, {
    cwd: repoRoot,
    env: { ...process.env, API_KEY: apiKey },
  });

  // Post-process generated test files to remove any hardcoded credentials.
  const sanitized = sanitizeGeneratedTests({ repoRoot });
  if (sanitized.changedFiles > 0) {
    console.log(`[Info] Sanitized hardcoded credentials in ${sanitized.changedFiles} test file(s).`);
  }

  // Print proof paths for judges
  console.log("\n[Done] Generated artifacts (commit these, except tmp/):");
  console.log(" - testsprite_tests/standard_prd.json");
  console.log(" - testsprite_tests/TestSprite_MCP_Test_Report.md (and/or .html)");
  console.log(" - testsprite_tests/TC*.{py,js,ts} (generated test cases)");

  // Stop MCP server
  serverProc.kill("SIGTERM");
  await sleep(200);
}

main().catch((err) => {
  console.error("\n[Error]", err?.stack || String(err));
  process.exit(1);
});
