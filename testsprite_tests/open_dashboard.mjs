import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function readTestSpriteApiKey() {
  if (process.env.API_KEY) return process.env.API_KEY;
  if (process.env.TESTSPRITE_API_KEY) return process.env.TESTSPRITE_API_KEY;
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
      const err = new Error(`Exited code=${code} signal=${signal}`);
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
      try { msg = JSON.parse(line); } catch { continue; }
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
  request(method, params, { timeoutMs = 86400000 } = {}) {
    // 24 hour timeout
    const id = this.nextId++;
    const payload = { jsonrpc: "2.0", id, method, params };
    this.proc.stdin.write(JSON.stringify(payload) + "\n");
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timeout ${method}`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(timeout); resolve(v); },
        reject:  (e) => { clearTimeout(timeout); reject(e); },
      });
    });
  }
  notify(method, params) {
    const payload = { jsonrpc: "2.0", method, params };
    this.proc.stdin.write(JSON.stringify(payload) + "\n");
  }
}

async function main() {
  const repoRoot = process.cwd();
  const apiKey = readTestSpriteApiKey();
  if (!apiKey) throw new Error("Missing API_KEY (export API_KEY=...)");

  console.log("Starting TestSprite MCP server...");
  const serverProc = spawn("npx", ["-y", "@testsprite/testsprite-mcp@latest"], {
    cwd: repoRoot,
    env: { ...process.env, API_KEY: apiKey },
    stdio: ["pipe", "pipe", "inherit"],
  });

  process.on("SIGINT", () => {
    console.log("Shutting down MCP server...");
    serverProc.kill("SIGTERM");
    process.exit(0);
  });

  const mcp = new McpRpcClient(serverProc);
  await mcp.request("initialize", {
    protocolVersion: "2025-11-25",
    capabilities: { tools: {} },
    clientInfo: { name: "sentimeter-testsprite-runner", version: "1.0.0" },
  });
  mcp.notify("notifications/initialized", {});

  console.log("Opening testsprite_open_test_result_dashboard...");
  
  // Launch the dashboard! This will block until the user is done or we press Ctrl+C
  const resp = await mcp.request(
    "tools/call",
    {
      name: "testsprite_open_test_result_dashboard",
      arguments: {
        projectPath: repoRoot,
      },
    },
    { timeoutMs: 86400000 }
  );
  
  try {
    // Parse the response to print it nicely
    const rawContent = resp.content.find(c => c.type === 'text')?.text;
    if (rawContent) {
      const parsed = JSON.parse(rawContent);
      if (parsed.message) {
        console.log("\n" + parsed.message + "\n");
      }
    } else {
      console.log(JSON.stringify(resp, null, 2));
    }
  } catch (e) {
    console.log(JSON.stringify(resp, null, 2));
  }

  console.log("\nThe dashboard dashboard is now open! DO NOT CLOSE THIS TERMINAL yet.");
  console.log("Press Ctrl+C here when you are completely done reviewing.");

  // Keep the process alive indefinitely
  await new Promise(() => {});
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
