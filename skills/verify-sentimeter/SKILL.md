---
name: verify-sentimeter
description: Drive the real Sentimeter site (Next.js docs and landing pages with live feedback widgets) and its local registry Worker in a headless Chrome the run owns, then capture ARIA snapshots, screenshots, and HTTP proof. Use to prove a widget, docs page, install command, or registry change works the way a user meets it, before claiming it is done.
---

# Verify Sentimeter

Sentimeter's user surface is the public site in `apps/web`: the landing page,
the widget docs at `/components/<slug>` with a live local demo of each widget,
and the install commands. The second surface is the registry Worker in
`apps/registry`, which serves the JSON that `shadcn add` installs. The hosted
dashboard is unreleased and stays closed during verification.

Everything goes through one helper, run from the repository root:

```sh
SV=skills/verify-sentimeter/scripts/sv.ts
$SV help
```

It builds the site, serves it with `next start` on a private port, starts
headless Chrome with a scratch profile, and drives pages by ARIA role and
accessible name with real mouse and keyboard events. Before reaching for a
recipe, read [`features/README.md`](features/README.md).

## Launch

```sh
$SV launch              # site only: build, then serve on http://127.0.0.1:3107
$SV launch --registry   # also build registry JSON and run `wrangler dev` on :8797
```

- Ready when it prints `ready: run <id>` with the site URL and the evidence
  directory. The build takes about 10–60 s.
- `--no-build` reuses the last `apps/web/.next` build. Use it only when nothing
  has changed since that build; `doctor` will flag it if it is stale.
- `--port`, `--chrome-port` (default 9333), and `--registry-port` move the
  ports when something else holds them.
- The build runs with `HOSTED_ANALYTICS=off` and an empty `WAITLIST_SECRET`,
  so hosted routes stay closed and the waitlist never connects, whatever
  `apps/web/.env.local` holds. Never set either for verification.
- This is not the dev loop. Do not run `bun run dev` or `dev:hosted`; the user
  owns those. `next dev` writes to `apps/web/.next/dev`, so this production
  build does not disturb it.
- Only one verification instance runs at a time, because the build writes
  `apps/web/.next`. `launch` refuses to start while a previous run is up.

## Doctor

Run it first, and again whenever anything looks off:

```sh
$SV doctor
```

It exits non-zero unless all of these hold: the site and Chrome process groups
this run started are alive; the site port is served by this run's process, not
by another one; `GET /` returns the Sentimeter site; `/sign-in` redirects to
`/dashboard`, which proves hosted mode is off; the registry answers, if
launched; the build matches the current commit and uncommitted diff; and no
recorded browser request left `127.0.0.1`. A stale build means
`$SV stop && $SV launch`.

## Drive

All browser commands act on the run's single tab.

| Command                                                   | Does                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| `$SV open <path>`                                         | Navigate to `http://127.0.0.1:<port><path>` and wait for load         |
| `$SV click --role R --name N`                             | Scroll into view, wait until still, hit-test, real click              |
| `$SV hover --role R --name N`                             | Same, pointer move only                                               |
| `$SV type [--role textbox --name N] --text T`             | Click the field if given, then insert text                            |
| `$SV press <Key> [<Key>…] [--shift]`                      | Enter, Escape, Tab, Space, arrows, Home, End, Backspace               |
| `$SV wait --role R --name N [--state pressed]`            | Poll until it appears; `--gone` waits for removal                     |
| `$SV wait --text "Thanks!"`                               | Poll the rendered accessibility text                                  |
| `$SV snapshot [--out f.aria.txt]`                         | Accessibility tree with states such as `[pressed, focused, disabled]` |
| `$SV screenshot [--role R --name N] [--full] --out f.png` | Element clip at 2× or the viewport                                    |
| `$SV resize <w> <h>`                                      | Resize the browser window, for example `resize 400 900`               |
| `$SV net-check`                                           | Fail if any recorded request left `127.0.0.1`                         |

- Names match exactly by default. `--exact false` matches a case-insensitive
  substring.
- When several elements match, the command fails and says how many.
  Disambiguate with `--within-role R --within-name N` (for example the demo
  group `"Emoji Feedback local demo"`) or `--nth i`.
- `click`, `hover` and `type` retry for up to `--timeout` ms (default 3000) while a
  re-render settles, and fail with the covering element's HTML if something
  else is on top. Treat that as a real finding, not as flakiness.
- Snapshots and screenshots written with a relative `--out` go into the run's
  evidence directory (`$SV evidence` prints it).

For the registry, use HTTP against `http://127.0.0.1:8797/r/<name>.json`, as
shown in [`features/registry.md`](features/registry.md).

## Evidence

Evidence lives in `~/.cache/sentimeter-verify/runs/<run-id>/evidence/`, outside
the repo, and survives `stop`. Name files `<feature>/<NN>-<state>.<ext>`.

Proof standards:

- Drive the user's path: the visible controls on the real page, by role and
  name. Never call widget internals, set state from the console, or use test
  fixtures as proof.
- Capture the action and the resulting state. Take a snapshot before and after
  the step that matters, plus one screenshot of the end state.
- Check side effects as well as the screen. The local demos promise "no
  network request", so finish with `$SV net-check`. For the registry, record
  status, headers, and body fields.
- Don't mock anything. Demos complete locally by design; the waitlist and
  hosted analytics are out of scope and stay off.
- A screenshot alone is not proof of a state. Pair it with the snapshot that
  shows `[pressed]`, `[disabled]`, the `status` text, or the field `value`.

## Cleanup

```sh
$SV stop
```

This stops only the process groups this run started (site, Chrome, registry),
deletes the Chrome profile and the run marker, and prints the evidence
directory, which it keeps. Run it after every failed attempt as well. Never
kill by process name: the user may have their own `next dev`, Chrome, or
`wrangler` running. `bun run registry:build` (run by `launch --registry`)
rewrites the ignored `apps/registry/public/r/` with current output, which is
expected and needs no cleanup.

## Helpers

- `scripts/sv.ts` is an executable Bun script (`#!/usr/bin/env bun`) that drives
  Chrome through the DevTools Protocol. It needs no new dependencies.
- Chrome is expected at `/Applications/Google Chrome.app`. Override it with
  `CHROME_PATH`. Override the evidence home with `SENTIMETER_VERIFY_HOME`.
- Run state lives in `~/.cache/sentimeter-verify/current.json`, and per-run
  logs live next to `evidence/`: `build.log`, `site.log`, `chrome.log`,
  `registry.log`, and `network.log`.
