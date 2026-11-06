#!/usr/bin/env bun
// Verification driver for Sentimeter: a production build of the site on a
// private port, an optional local registry Worker, and a headless Chrome the
// run owns. Every browser action goes through Chrome DevTools Protocol with
// real mouse and keyboard events, located by ARIA role and accessible name.

import { spawn, spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";

const REPO = spawnSync("git", ["rev-parse", "--show-toplevel"], {
  cwd: dirname(new URL(import.meta.url).pathname),
  encoding: "utf8",
}).stdout.trim();
const HOME =
  process.env.SENTIMETER_VERIFY_HOME ??
  join(homedir(), ".cache", "sentimeter-verify");
const CURRENT = join(HOME, "current.json");
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

type State = {
  runId: string;
  runDir: string;
  evidenceDir: string;
  profileDir: string;
  sitePort: number;
  sitePgid: number;
  chromePort: number;
  chromePgid: number;
  registryPort?: number;
  registryPgid?: number;
  gitRev: string;
  treeHash: string;
  builtAt: string;
};

// ---------- small utilities ----------

function die(message: string): never {
  console.error(`sv: ${message}`);
  process.exit(1);
}

function args() {
  const [command = "help", ...rest] = process.argv.slice(2);
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const token = rest[i]!;
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = rest[i + 1];
      if (next === undefined || next.startsWith("--")) flags[key] = "true";
      else {
        flags[key] = next;
        i++;
      }
    } else positional.push(token);
  }
  return { command, flags, positional };
}

function readState(): State {
  if (!existsSync(CURRENT))
    die("no running instance. Start one with `sv launch`.");
  return JSON.parse(readFileSync(CURRENT, "utf8")) as State;
}

function alive(pgid: number | undefined) {
  if (!pgid) return false;
  try {
    process.kill(-pgid, 0);
    return true;
  } catch {
    return false;
  }
}

function treeHash() {
  // Fingerprint of the working tree the build came from, uncommitted edits included.
  const status = spawnSync("git", ["status", "--porcelain", "-uno"], {
    cwd: REPO,
    encoding: "utf8",
  }).stdout;
  const diff = spawnSync("git", ["diff", "HEAD"], {
    cwd: REPO,
    encoding: "utf8",
    maxBuffer: 1 << 28,
  }).stdout;
  return new Bun.CryptoHasher("sha1")
    .update(status + diff)
    .digest("hex")
    .slice(0, 12);
}

function gitRev() {
  return spawnSync("git", ["rev-parse", "--short", "HEAD"], {
    cwd: REPO,
    encoding: "utf8",
  }).stdout.trim();
}

function startDetached(
  command: string,
  argv: string[],
  cwd: string,
  log: string,
  env: Record<string, string> = {},
) {
  const fd = openSync(log, "a");
  const child = spawn(command, argv, {
    cwd,
    detached: true, // new process group, so teardown kills exactly what we started
    stdio: ["ignore", fd, fd],
    env: { ...process.env, ...env },
  });
  child.unref();
  if (!child.pid) die(`could not start ${command}`);
  return child.pid;
}

async function waitFor(
  check: () => Promise<boolean>,
  timeoutMs: number,
  what: string,
) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    if (await check().catch(() => false)) return;
    await Bun.sleep(250);
  }
  die(`timed out after ${timeoutMs} ms waiting for ${what}`);
}

async function freePort(port: number) {
  const out = spawnSync(
    "lsof",
    ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"],
    { encoding: "utf8" },
  ).stdout.trim();
  return out === "";
}

function listenerPgids(port: number) {
  const pids = spawnSync(
    "lsof",
    ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"],
    { encoding: "utf8" },
  )
    .stdout.trim()
    .split("\n")
    .filter(Boolean);
  return pids.map((pid) =>
    Number(
      spawnSync("ps", ["-o", "pgid=", "-p", pid], {
        encoding: "utf8",
      }).stdout.trim(),
    ),
  );
}

function evidencePath(state: State, out: string) {
  const path = isAbsolute(out) ? out : join(state.evidenceDir, out);
  mkdirSync(dirname(path), { recursive: true });
  return path;
}

// ---------- CDP ----------

class Cdp {
  private ws!: WebSocket;
  private id = 0;
  private pending = new Map<
    number,
    { resolve: (v: any) => void; reject: (e: Error) => void }
  >();
  private listeners: ((method: string, params: any) => void)[] = [];

  static async page(state: State) {
    const base = `http://127.0.0.1:${state.chromePort}`;
    let targets = (await (await fetch(`${base}/json/list`)).json()) as any[];
    let page = targets.find((t) => t.type === "page");
    if (!page) {
      page = await (
        await fetch(`${base}/json/new?about:blank`, { method: "PUT" })
      ).json();
    }
    const cdp = new Cdp();
    await cdp.connect(page.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Network.enable");
    await cdp.send("DOM.enable");
    await cdp.send("Accessibility.enable");
    const netLog = join(state.runDir, "network.log");
    cdp.on((method, params) => {
      if (method === "Network.requestWillBeSent") {
        appendFileSync(
          netLog,
          `${params.request.method} ${params.request.url}\n`,
        );
      }
    });
    return cdp;
  }

  connect(url: string) {
    return new Promise<void>((ok, fail) => {
      this.ws = new WebSocket(url);
      this.ws.onopen = () => ok();
      this.ws.onerror = () => fail(new Error(`cannot connect to ${url}`));
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(String(event.data));
        if (msg.id !== undefined) {
          const waiter = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error)
            waiter?.reject(
              new Error(`${msg.error.message} ${msg.error.data ?? ""}`),
            );
          else waiter?.resolve(msg.result);
        } else for (const l of this.listeners) l(msg.method, msg.params);
      };
    });
  }

  on(listener: (method: string, params: any) => void) {
    this.listeners.push(listener);
  }

  send(method: string, params: Record<string, unknown> = {}): Promise<any> {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) =>
      this.pending.set(id, { resolve, reject }),
    );
  }

  close() {
    this.ws.close();
  }
}

type AxNode = {
  nodeId: string;
  parentId?: string;
  childIds?: string[];
  ignored: boolean;
  role?: { value: string };
  name?: { value: string };
  properties?: { name: string; value: { value: unknown } }[];
  backendDOMNodeId?: number;
};

async function axTree(cdp: Cdp) {
  const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as {
    nodes: AxNode[];
  };
  return nodes;
}

function prop(node: AxNode, name: string) {
  return node.properties?.find((p) => p.name === name)?.value.value;
}

function matches(
  node: AxNode,
  role: string | undefined,
  name: string | undefined,
  exact: boolean,
) {
  if (node.ignored) return false;
  if (role && node.role?.value !== role) return false;
  if (name !== undefined) {
    const actual = node.name?.value ?? "";
    if (
      exact
        ? actual !== name
        : !actual.toLowerCase().includes(name.toLowerCase())
    )
      return false;
  }
  return true;
}

// Retries for up to --timeout ms (default 3000) so a re-render in flight does
// not fail the step; only the last attempt's error is reported.
async function find(cdp: Cdp, flags: Record<string, string>): Promise<AxNode> {
  const end = Date.now() + Number(flags.timeout ?? 3000);
  for (;;) {
    try {
      return await findOnce(cdp, flags);
    } catch (error) {
      if (Date.now() > end) die((error as Error).message);
      await Bun.sleep(150);
    }
  }
}

async function findOnce(cdp: Cdp, flags: Record<string, string>) {
  const die: (message: string) => never = (message) => {
    throw new Error(message);
  };
  const role = flags.role;
  const name = flags.name;
  if (!role && !name) die("give --role and/or --name");
  const exact = flags.exact !== "false";
  const nodes = await axTree(cdp);
  let pool = nodes;
  if (flags["within-role"] || flags["within-name"]) {
    const scope = nodes.find((n) =>
      matches(n, flags["within-role"], flags["within-name"], exact),
    );
    if (!scope)
      die(
        `no scope matching role=${flags["within-role"]} name=${flags["within-name"]}`,
      );
    pool = subtree(nodes, scope);
  }
  const hits = pool.filter(
    (n) => matches(n, role, name, exact) && n.backendDOMNodeId,
  );
  if (hits.length === 0)
    die(
      `no element with role=${role ?? "*"} name=${JSON.stringify(name ?? "*")}`,
    );
  const nth = flags.nth === undefined ? undefined : Number(flags.nth);
  if (nth === undefined && hits.length > 1) {
    die(
      `${hits.length} elements match role=${role ?? "*"} name=${JSON.stringify(name ?? "*")}; narrow with --within-role/--within-name or pick one with --nth`,
    );
  }
  const hit = hits[nth ?? 0];
  if (!hit) die(`--nth ${nth} is out of range (${hits.length} matches)`);
  return hit;
}

function subtree(nodes: AxNode[], root: AxNode) {
  const byId = new Map(nodes.map((n) => [n.nodeId, n]));
  const out: AxNode[] = [];
  const walk = (n: AxNode) => {
    out.push(n);
    for (const id of n.childIds ?? []) {
      const child = byId.get(id);
      if (child) walk(child);
    }
  };
  walk(root);
  return out;
}

// Scrolls the element into view, waits for smooth scrolling and entrance
// animations to stop moving it, then hit-tests the point so a click can never
// land on whatever slid underneath.
async function center(cdp: Cdp, node: AxNode) {
  const { object } = await cdp.send("DOM.resolveNode", {
    backendNodeId: node.backendDOMNodeId,
  });
  await cdp.send("Runtime.callFunctionOn", {
    objectId: object.objectId,
    functionDeclaration:
      "function () { this.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' }); }",
  });
  const read = async () => {
    const { result } = await cdp.send("Runtime.callFunctionOn", {
      objectId: object.objectId,
      functionDeclaration:
        "function () { const r = this.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }",
      returnByValue: true,
    });
    return result.value as { x: number; y: number };
  };
  let point = await read();
  const end = Date.now() + 2000;
  for (;;) {
    await Bun.sleep(80);
    const next = await read();
    const still =
      Math.abs(next.x - point.x) < 0.5 && Math.abs(next.y - point.y) < 0.5;
    point = next;
    if (still || Date.now() > end) break;
  }
  const { result } = await cdp.send("Runtime.callFunctionOn", {
    objectId: object.objectId,
    functionDeclaration: `function (x, y) {
      const top = document.elementFromPoint(x, y);
      if (!top) return "nothing (point is outside the viewport)";
      if (this === top || this.contains(top) || top.closest("label")?.control === this) return "";
      return top.outerHTML.slice(0, 160);
    }`,
    arguments: [{ value: point.x }, { value: point.y }],
    returnByValue: true,
  });
  if (result.value) {
    die(
      `${node.role?.value} ${JSON.stringify(node.name?.value ?? "")} is covered at (${Math.round(point.x)}, ${Math.round(point.y)}) by ${result.value}`,
    );
  }
  return point;
}

async function mouse(cdp: Cdp, x: number, y: number, click: boolean) {
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  if (!click) return;
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
  await cdp.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
}

const KEYS: Record<string, { code: string; keyCode: number; text?: string }> = {
  Enter: { code: "Enter", keyCode: 13, text: "\r" },
  Escape: { code: "Escape", keyCode: 27 },
  Tab: { code: "Tab", keyCode: 9 },
  " ": { code: "Space", keyCode: 32, text: " " },
  Space: { code: "Space", keyCode: 32, text: " " },
  ArrowLeft: { code: "ArrowLeft", keyCode: 37 },
  ArrowUp: { code: "ArrowUp", keyCode: 38 },
  ArrowRight: { code: "ArrowRight", keyCode: 39 },
  ArrowDown: { code: "ArrowDown", keyCode: 40 },
  Home: { code: "Home", keyCode: 36 },
  End: { code: "End", keyCode: 35 },
  Backspace: { code: "Backspace", keyCode: 8 },
};

async function press(cdp: Cdp, key: string, shift = false) {
  const spec =
    KEYS[key] ??
    die(`unsupported key ${key}; use one of ${Object.keys(KEYS).join(", ")}`);
  const base = {
    key: key === "Space" ? " " : key,
    code: spec.code,
    windowsVirtualKeyCode: spec.keyCode,
    modifiers: shift ? 8 : 0,
  };
  await cdp.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    ...base,
    text: spec.text,
  });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
}

async function settle(cdp: Cdp, ms = 400) {
  // Let transitions and React commits finish before the next read.
  await Bun.sleep(ms);
  await cdp.send("Runtime.evaluate", {
    expression:
      "new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))",
    awaitPromise: true,
  });
}

function renderTree(nodes: AxNode[], root: AxNode) {
  const byId = new Map(nodes.map((n) => [n.nodeId, n]));
  const lines: string[] = [];
  const skip = new Set(["generic", "none", "InlineTextBox", "LineBreak"]);
  const walk = (n: AxNode, depth: number, parentName = "") => {
    const role = n.role?.value ?? "";
    const name = n.name?.value ?? "";
    const shown =
      !n.ignored &&
      role !== "InlineTextBox" &&
      !(skip.has(role) && !name) &&
      !(role === "StaticText" && (!name.trim() || name === parentName));
    if (shown) {
      const states = [
        "pressed",
        "checked",
        "selected",
        "expanded",
        "disabled",
        "focused",
        "invalid",
        "required",
      ]
        .map((p) => [p, prop(n, p)] as const)
        .filter(([, v]) => v !== undefined && v !== false && v !== "false")
        .map(([p, v]) => (v === true || v === "true" ? p : `${p}=${v}`));
      const value = prop(n, "valuetext") ?? (n as any).value?.value;
      lines.push(
        `${"  ".repeat(depth)}${role}${name ? ` ${JSON.stringify(name)}` : ""}${value ? ` value=${JSON.stringify(value)}` : ""}${states.length ? ` [${states.join(", ")}]` : ""}`,
      );
    }
    for (const id of n.childIds ?? []) {
      const child = byId.get(id);
      if (child) walk(child, shown ? depth + 1 : depth, name || parentName);
    }
  };
  walk(root, 0);
  return lines.join("\n");
}

// ---------- commands ----------

async function launch(flags: Record<string, string>) {
  if (existsSync(CURRENT)) {
    const old = JSON.parse(readFileSync(CURRENT, "utf8")) as State;
    if (
      alive(old.sitePgid) ||
      alive(old.chromePgid) ||
      alive(old.registryPgid)
    ) {
      die(
        `run ${old.runId} is still up. Drive it, or run \`sv stop\` first. Only one verification instance runs at a time because the build writes apps/web/.next.`,
      );
    }
    rmSync(CURRENT);
  }
  const sitePort = Number(flags.port ?? 3107);
  const chromePort = Number(flags["chrome-port"] ?? 9333);
  for (const port of [sitePort, chromePort]) {
    if (!(await freePort(port)))
      die(
        `port ${port} is taken by something this run did not start. Pick another with --port/--chrome-port.`,
      );
  }
  if (!existsSync(CHROME))
    die(`Chrome not found at ${CHROME}; set CHROME_PATH.`);

  const runId = new Date().toISOString().replace(/[:.]/g, "-");
  const runDir = join(HOME, "runs", runId);
  const evidenceDir = join(runDir, "evidence");
  const profileDir = join(runDir, "chrome-profile");
  mkdirSync(evidenceDir, { recursive: true });

  // Hosted analytics stays closed and the waitlist never wires up, whatever
  // apps/web/.env.local holds.
  const siteEnv = {
    HOSTED_ANALYTICS: "off",
    WAITLIST_SECRET: "",
    NEXT_TELEMETRY_DISABLED: "1",
  };
  const revision = gitRev();
  const hash = treeHash();
  if (flags["no-build"] !== "true") {
    console.log(`building apps/web from ${revision} (tree ${hash}) …`);
    const build = spawnSync("bun", ["run", "build"], {
      cwd: join(REPO, "apps/web"),
      env: { ...process.env, ...siteEnv },
      encoding: "utf8",
      maxBuffer: 1 << 28,
    });
    writeFileSync(join(runDir, "build.log"), build.stdout + build.stderr);
    if (build.status !== 0)
      die(`site build failed; see ${join(runDir, "build.log")}`);
  }

  const next = join(REPO, "apps/web/node_modules/.bin/next");
  const sitePgid = startDetached(
    next,
    ["start", "-p", String(sitePort), "-H", "127.0.0.1"],
    join(REPO, "apps/web"),
    join(runDir, "site.log"),
    siteEnv,
  );
  const chromePgid = startDetached(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${chromePort}`,
      "--remote-debugging-address=127.0.0.1",
      `--user-data-dir=${profileDir}`,
      "--window-size=1280,900",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-sync",
      "about:blank",
    ],
    runDir,
    join(runDir, "chrome.log"),
  );

  const state: State = {
    runId,
    runDir,
    evidenceDir,
    profileDir,
    sitePort,
    sitePgid,
    chromePort,
    chromePgid,
    gitRev: revision,
    treeHash: hash,
    builtAt: new Date().toISOString(),
  };

  if (flags.registry === "true") {
    const registryPort = Number(flags["registry-port"] ?? 8797);
    if (!(await freePort(registryPort)))
      die(`registry port ${registryPort} is taken`);
    const built = spawnSync("bun", ["run", "registry:build"], {
      cwd: REPO,
      encoding: "utf8",
    });
    if (built.status !== 0)
      die(`registry build failed:\n${built.stdout}${built.stderr}`);
    state.registryPort = registryPort;
    state.registryPgid = startDetached(
      join(REPO, "apps/registry/node_modules/.bin/wrangler"),
      ["dev", "--port", String(registryPort), "--ip", "127.0.0.1"],
      join(REPO, "apps/registry"),
      join(runDir, "registry.log"),
      { WRANGLER_SEND_METRICS: "false", CI: "1" },
    );
  }
  writeFileSync(CURRENT, JSON.stringify(state, null, 2));

  await waitFor(
    async () => (await fetch(`http://127.0.0.1:${sitePort}/`)).ok,
    60_000,
    `site on :${sitePort}`,
  );
  await waitFor(
    async () => (await fetch(`http://127.0.0.1:${chromePort}/json/version`)).ok,
    30_000,
    `Chrome on :${chromePort}`,
  );
  if (state.registryPort) {
    await waitFor(
      async () =>
        (await fetch(`http://127.0.0.1:${state.registryPort}/r/registry.json`))
          .ok,
      60_000,
      `registry on :${state.registryPort}`,
    );
  }
  console.log(`ready: run ${runId}`);
  console.log(`  site      http://127.0.0.1:${sitePort}`);
  if (state.registryPort)
    console.log(
      `  registry  http://127.0.0.1:${state.registryPort}/r/<name>.json`,
    );
  console.log(`  evidence  ${evidenceDir}`);
}

async function doctor() {
  const s = readState();
  let failed = false;
  const report = (ok: boolean, line: string) => {
    console.log(`${ok ? "ok  " : "FAIL"} ${line}`);
    if (!ok) failed = true;
  };
  report(alive(s.sitePgid), `site process group ${s.sitePgid} is running`);
  report(
    listenerPgids(s.sitePort).includes(s.sitePgid),
    `:${s.sitePort} is served by this run, not another process`,
  );
  const home = await fetch(`http://127.0.0.1:${s.sitePort}/`)
    .then((r) => r.text())
    .catch(() => "");
  report(home.includes("Sentimeter"), `GET / answers with the Sentimeter site`);
  // Outside live hosted mode, /sign-in redirects to /dashboard (apps/web/lib/hosted-config.ts).
  const signIn = await fetch(`http://127.0.0.1:${s.sitePort}/sign-in`, {
    redirect: "manual",
  }).catch(() => null);
  report(
    !!signIn &&
      signIn.status >= 300 &&
      signIn.status < 400 &&
      (signIn.headers.get("location") ?? "").endsWith("/dashboard"),
    `hosted analytics is closed (/sign-in redirects to /dashboard)`,
  );
  report(
    alive(s.chromePgid),
    `Chrome process group ${s.chromePgid} is running`,
  );
  report(
    await fetch(`http://127.0.0.1:${s.chromePort}/json/version`)
      .then((r) => r.ok)
      .catch(() => false),
    `Chrome DevTools answers on :${s.chromePort}`,
  );
  if (s.registryPort) {
    report(
      alive(s.registryPgid),
      `registry process group ${s.registryPgid} is running`,
    );
    report(
      await fetch(`http://127.0.0.1:${s.registryPort}/r/registry.json`)
        .then((r) => r.ok)
        .catch(() => false),
      `registry answers on :${s.registryPort}`,
    );
  }
  const rev = gitRev();
  const hash = treeHash();
  report(
    rev === s.gitRev && hash === s.treeHash,
    `build matches the working tree (built ${s.gitRev}/${s.treeHash}, now ${rev}/${hash})${rev === s.gitRev && hash === s.treeHash ? "" : " — run `sv stop && sv launch` to rebuild"}`,
  );
  const leaks = foreignHosts(s);
  report(
    leaks.length === 0,
    `no requests left 127.0.0.1${leaks.length ? `: ${leaks.join(", ")}` : ""}`,
  );
  console.log(`run ${s.runId}, evidence in ${s.evidenceDir}`);
  process.exit(failed ? 1 : 0);
}

function foreignHosts(s: State) {
  const log = join(s.runDir, "network.log");
  if (!existsSync(log)) return [];
  const hosts = new Set<string>();
  for (const line of readFileSync(log, "utf8").split("\n")) {
    const url = line.split(" ")[1];
    if (!url || !/^(https?|wss?):/.test(url)) continue;
    const host = new URL(url).hostname;
    if (host !== "127.0.0.1" && host !== "localhost") hosts.add(host);
  }
  return [...hosts];
}

async function withPage<T>(fn: (cdp: Cdp, s: State) => Promise<T>) {
  const s = readState();
  const cdp = await Cdp.page(s);
  try {
    return await fn(cdp, s);
  } finally {
    cdp.close();
  }
}

async function main() {
  const { command, flags, positional } = args();
  switch (command) {
    case "launch":
      return launch(flags);
    case "doctor":
      return doctor();
    case "open":
      return withPage(async (cdp, s) => {
        const path = positional[0] ?? "/";
        const url = /^https?:/.test(path)
          ? path
          : `http://127.0.0.1:${s.sitePort}${path}`;
        const loaded = new Promise<void>((ok) =>
          cdp.on((m) => m === "Page.loadEventFired" && ok()),
        );
        await cdp.send("Page.navigate", { url });
        await Promise.race([loaded, Bun.sleep(20_000)]);
        await settle(cdp, 600);
        const { result } = await cdp.send("Runtime.evaluate", {
          expression: "document.title",
        });
        console.log(`opened ${url} — "${result.value}"`);
      });
    case "click":
    case "hover":
      return withPage(async (cdp) => {
        const node = await find(cdp, flags);
        const { x, y } = await center(cdp, node);
        await mouse(cdp, x, y, command === "click");
        await settle(cdp);
        console.log(
          `${command}ed ${node.role?.value} ${JSON.stringify(node.name?.value ?? "")}`,
        );
      });
    case "type":
      return withPage(async (cdp) => {
        const text = flags.text ?? die("give --text");
        if (flags.role || flags.name) {
          const node = await find(cdp, flags);
          const { x, y } = await center(cdp, node);
          await mouse(cdp, x, y, true);
        }
        await cdp.send("Input.insertText", { text });
        await settle(cdp, 200);
        console.log(`typed ${JSON.stringify(text)}`);
      });
    case "press":
      return withPage(async (cdp) => {
        for (const key of positional)
          await press(cdp, key, flags.shift === "true");
        await settle(cdp);
        console.log(`pressed ${positional.join(" ")}`);
      });
    case "snapshot":
      return withPage(async (cdp, s) => {
        let nodes = await axTree(cdp);
        let root = nodes[0]!;
        if (flags["within-role"] || flags["within-name"]) {
          const scope = await find(cdp, {
            role: flags["within-role"] ?? "",
            name: flags["within-name"] ?? "",
            exact: flags.exact ?? "true",
          }).catch(() => undefined);
          nodes = await axTree(cdp);
          root =
            nodes.find(
              (n) =>
                n.backendDOMNodeId === scope?.backendDOMNodeId &&
                matches(
                  n,
                  flags["within-role"],
                  flags["within-name"],
                  flags.exact !== "false",
                ),
            ) ??
            die(
              `scope role=${flags["within-role"]} name=${flags["within-name"]} not found`,
            );
        }
        const text = renderTree(nodes, root);
        if (flags.out) {
          const path = evidencePath(s, flags.out);
          writeFileSync(path, text + "\n");
          console.log(`snapshot → ${path}`);
        } else console.log(text);
      });
    case "wait":
      return withPage(async (cdp) => {
        const timeout = Number(flags.timeout ?? 5000);
        const end = Date.now() + timeout;
        const exact = flags.exact !== "false";
        while (Date.now() < end) {
          const nodes = await axTree(cdp);
          const hit = flags.text
            ? renderTree(nodes, nodes[0]!).includes(flags.text)
            : nodes.some(
                (n) =>
                  matches(n, flags.role, flags.name, exact) &&
                  (!flags.state ||
                    prop(n, flags.state) === true ||
                    prop(n, flags.state) === "true"),
              );
          if (hit === (flags.gone !== "true")) {
            console.log(`wait satisfied`);
            return;
          }
          await Bun.sleep(150);
        }
        die(`wait timed out after ${timeout} ms (${JSON.stringify(flags)})`);
      });
    case "screenshot":
      return withPage(async (cdp, s) => {
        const out = evidencePath(s, flags.out ?? `shot-${Date.now()}.png`);
        let clip;
        if (flags.role || flags.name) {
          const node = await find(cdp, flags);
          const { object } = await cdp.send("DOM.resolveNode", {
            backendNodeId: node.backendDOMNodeId,
          });
          await cdp.send("Runtime.callFunctionOn", {
            objectId: object.objectId,
            functionDeclaration:
              "function () { this.scrollIntoView({ block: 'center', behavior: 'instant' }); }",
          });
          await settle(cdp, 150);
          const { result } = await cdp.send("Runtime.callFunctionOn", {
            objectId: object.objectId,
            functionDeclaration:
              "function () { const r = this.getBoundingClientRect(); return [r.left + scrollX, r.top + scrollY, r.width, r.height]; }",
            returnByValue: true,
          });
          const [x, y, width, height] = result.value as number[];
          const pad = 16;
          clip = {
            x: Math.max(0, x! - pad),
            y: Math.max(0, y! - pad),
            width: width! + pad * 2,
            height: height! + pad * 2,
            scale: 2,
          };
        }
        const { data } = await cdp.send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: !!clip || flags.full === "true",
          clip,
        });
        writeFileSync(out, Buffer.from(data, "base64"));
        console.log(`screenshot → ${out}`);
      });
    case "resize":
      return withPage(async (cdp) => {
        const [w, h] = positional.map(Number);
        if (!w || !h) die("usage: sv resize <width> <height>");
        const { windowId } = await cdp.send("Browser.getWindowForTarget");
        await cdp.send("Browser.setWindowBounds", {
          windowId,
          bounds: { width: w, height: h },
        });
        await settle(cdp);
        console.log(`window ${w}×${h}`);
      });
    case "net-check": {
      const s = readState();
      const leaks = foreignHosts(s);
      if (leaks.length) die(`requests left 127.0.0.1: ${leaks.join(", ")}`);
      console.log("no requests left 127.0.0.1");
      return;
    }
    case "evidence":
      console.log(readState().evidenceDir);
      return;
    case "stop": {
      if (!existsSync(CURRENT)) {
        console.log("nothing to stop");
        return;
      }
      const s = readState();
      for (const [label, pgid] of [
        ["site", s.sitePgid],
        ["chrome", s.chromePgid],
        ["registry", s.registryPgid],
      ] as const) {
        if (!pgid || !alive(pgid)) continue;
        try {
          process.kill(-pgid, "SIGTERM");
        } catch {}
        const end = Date.now() + 5000;
        while (alive(pgid) && Date.now() < end) await Bun.sleep(100);
        if (alive(pgid)) process.kill(-pgid, "SIGKILL");
        console.log(`stopped ${label} (process group ${pgid})`);
      }
      rmSync(s.profileDir, { recursive: true, force: true });
      rmSync(CURRENT);
      const kept = existsSync(s.evidenceDir)
        ? spawnSync("find", [s.evidenceDir, "-type", "f"], { encoding: "utf8" })
            .stdout.trim()
            .split("\n")
            .filter(Boolean)
        : [];
      console.log(`evidence kept in ${s.evidenceDir} (${kept.length} files)`);
      return;
    }
    default:
      console.log(
        readFileSync(
          resolve(dirname(new URL(import.meta.url).pathname), "../SKILL.md"),
          "utf8",
        ).split("## Drive")[0],
      );
      console.log(
        "commands: launch [--port N] [--registry] [--no-build] | doctor | open <path> | click|hover --role R --name N [--within-role R --within-name N] [--nth i] [--exact false] | type [--role textbox --name N] --text T | press <Key…> | wait (--role R --name N [--state pressed] | --text T) [--gone] [--timeout ms] | snapshot [--within-role R --within-name N] [--out file] | screenshot [--role R --name N] [--full] [--out file.png] | resize W H | net-check | evidence | stop",
      );
  }
}

await main();
