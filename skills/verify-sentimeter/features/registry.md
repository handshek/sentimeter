# Registry

The registry Worker serves each widget as shadcn registry JSON at
`/r/<name>.json`. `shadcn add <url>` fetches it, installs the widget wrapper,
and follows `registryDependencies` to the shared `feedback-system` item and
the shadcn primitives. This is how developers get Sentimeter.

## Sub-features

- `registry-items`: `emoji-feedback`, `like-dislike`, `star-rating`, `feedback-system`, and the `registry` index return `200 application/json`.
- `registry-shape`: a widget item is `type: "registry:block"` with one file and `registryDependencies` pointing at `feedback-system`.
- `registry-missing`: unknown names return `404`.
- `registry-install`: `shadcn add` into a host project gives code that type-checks.

## How to get to it (user POV)

- A developer runs the command from the docs Installation section, for example `bunx shadcn@latest add "https://registry.handshek.workers.dev/r/emoji-feedback.json"`.
- Tools and browsers fetch `https://registry.handshek.workers.dev/r/<name>.json` directly.

## Driving it with sv

Preconditions:

- `$SV launch --registry`, and `$SV doctor` reports `registry answers on :8797`.

- **Fetch an item.** `curl -s -D - http://127.0.0.1:8797/r/emoji-feedback.json -o emoji.json`, then `bun -e 'const j=require("./emoji.json");console.log(j.name,j.type,j.files.length,j.registryDependencies)'`. Expect `200`, `application/json`, `emoji-feedback registry:block 1 [".../r/feedback-system.json"]`.
- **Shared item.** `curl -s http://127.0.0.1:8797/r/feedback-system.json` lists the shared files. Comparing them with `packages/widgets/src` proves the build is current.
- **Missing item.** `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8797/r/nope.json` prints `404`.
- **Install into a host.** `bun run check-registry` runs a temporary shadcn build and type-checks the result in a host fixture. Run it while the site is up; it doesn't touch the run's ports. It copies every registry file into a temporary host project and runs `tsc` there. Exit code `0` and "Registry staging and temporary build are valid." prove the install. Save the output as `registry/check-registry.log`.
- **Proof.** Save the headers, the parsed fields and the check-registry output under `registry/` in the evidence directory.

## Gotchas

- `registryDependencies` always point at the production registry, so a real `shadcn add` from the local Worker still pulls `feedback-system` from production. Use `check-registry` to prove the local output, and compare `feedback-system.json` by hand.
- CORS is not applied. On 2026-11-03, responses carried no `Access-Control-Allow-Origin` header, locally and in production, and an `OPTIONS` preflight returned `405`. The probable cause: Cloudflare serves files in `public/` before the Worker's Hono `cors()` middleware runs. The shadcn CLI is unaffected; browser-based clients fetching cross-origin are. Check for `access-control-allow-origin` before claiming browser access works.
- `curl -I` sends HEAD. Use `curl -s -D - -o /dev/null` to see the GET headers.
- `launch --registry` rewrites the ignored `apps/registry/public/r/`. That's expected.
