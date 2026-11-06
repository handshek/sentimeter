# Install command

Each docs page, and the landing hero, shows the `shadcn add` command for the
widget, with a tab per package manager and a copy button. The docs page also
says how many files the install adds, can list their exact paths, and offers
the page as Markdown for coding agents.

## Sub-features

- `install-tabs`: the tabs "bun", "pnpm", "npm" and "yarn" switch the command shown in the tabpanel of the same name.
- `install-copy`: "Copy Command" copies the command. The button then reads "Copied", and a status says "Command copied to clipboard.".
- `install-files`: the "N Sentimeter Files" summary, plus a "View Exact File Paths" disclosure.
- `install-markdown`: the "Copy as Markdown" button in the page header, and the route `/components/<slug>/markdown`.
- `install-llms`: `/llms.txt` gives an index for agents.

## How to get to it (user POV)

- The Installation section of `/components/<slug>`.
- The landing hero at `/`, which has the same tabs and "Copy Command".
- "Copy as Markdown" next to the page heading.

## Driving it with sv

Preconditions:

- `$SV doctor` passes, and you have run `$SV open /components/star-rating`.

- **Read the command.** `$SV snapshot | grep -A2 'tabpanel "bun"'`. It shows `bunx shadcn@latest add "https://registry.handshek.workers.dev/r/star-rating.json"`.
- **Switch manager.** `$SV click --role tab --name "pnpm"`. The snapshot shows `tab "pnpm" [selected]`, and a `tabpanel "pnpm"` whose code uses pnpm and the same registry URL.
- **Copy.** `$SV click --role button --name "Copy Command"`, then `$SV wait --text "Command copied to clipboard."`. The snapshot shows `button "Copied"` and the status text.
- **File list.** `$SV click --role button --name "View Exact File Paths"`. The button becomes `[expanded]` and `region "View Exact File Paths"` lists one `listitem` per path, starting with `components/sentimeter/star-rating.tsx`. The count must match the summary ("15 Sentimeter Files": 1 widget wrapper + 14 shared files for star rating on 2026-11-06) and the registry (`files.length` of the widget item plus `feedback-system.json`).
- **Copy as Markdown.** `$SV click --role button --name "Copy as Markdown"`, then snapshot at once (it reverts after 1.4 s). It shows `button "Copied"` and a `status` reading "Markdown copied to clipboard." The copied text is `getWidgetMarkdown`, the same as the Markdown route below.
- **Markdown.** `curl -s -D - http://127.0.0.1:3107/components/star-rating/markdown` returns `200`, `text/markdown`, and a body starting with `# Star Rating`. `curl -s http://127.0.0.1:3107/llms.txt | head` starts with `# Sentimeter`.
- **Proof.** Save the snapshots and the curl output under `install/`, then run `$SV net-check`.

## Gotchas

- Commands always point at the production registry URL, even on the local site. That's correct; to test what that URL serves, use [registry](./registry.md).
- `/components/<slug>.md` returns 404. The Markdown route is `/components/<slug>/markdown`.
- Copying works in this headless Chrome. If "Copied" never appears, the copy failed; it isn't a timing problem. Check for `role="alert"` with a manual-copy fallback.
- Builds without PR #59 announce "as Markdown copied to clipboard." That is the old bug, not a new regression.
- The landing hero and the docs page each have their own "Copy Command". On `/` there is only one, but scope by section if more are added.
