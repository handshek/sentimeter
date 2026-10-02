# Sentimeter

Open-source feedback widgets for shadcn apps. Install accessible React source,
match your app's theme, and connect your own backend. No account required.

[Browse widgets](https://try-sentimeter.vercel.app/components) ·
[Getting started](https://try-sentimeter.vercel.app/components/getting-started) ·
[Agent docs](https://try-sentimeter.vercel.app/llms.txt) ·
[Contributing](CONTRIBUTING.md)

## Install a Widget

Start with a React + TypeScript + Tailwind app configured for
[shadcn](https://ui.shadcn.com/docs/installation).

```sh
bunx shadcn@latest add "https://registry.handshek.workers.dev/r/emoji-feedback.json"
```

Also available: [Like / Dislike](https://try-sentimeter.vercel.app/components/like-dislike)
and [Star Rating](https://try-sentimeter.vercel.app/components/star-rating).
Docs include Bun, pnpm, npm, and Yarn commands, live previews, and exact files.

```tsx
"use client";

import { EmojiFeedback } from "@/components/sentimeter/emoji-feedback";

export function FeedbackExample() {
  return <EmojiFeedback autoHide={false} />;
}
```

This completes locally: **nothing is sent or stored**. Pass an async `submit`
handler to save feedback using your own backend; resolve only after saving
succeeds and throw on failure. A custom handler takes precedence over a hosted
`apiKey`. With neither configured, submission stays local.

Installation adds 1 widget wrapper + 12 shared feedback-system files, using your
local shadcn Button, Textarea, utilities, and theme tokens plus `lucide-react`.
You own the installed source; no runtime Sentimeter package or iframe is needed.

## Agents

Start at [llms.txt](https://try-sentimeter.vercel.app/llms.txt). Each component has
a Markdown endpoint and a Copy as Markdown action. Merge this entry into your
existing `components.json` to enable namespaced installation:

```json
{
  "registries": {
    "@sentimeter": "https://registry.handshek.workers.dev/r/{name}.json"
  }
}
```

Then use `bunx shadcn@latest add @sentimeter/emoji-feedback` (or
`@sentimeter/like-dislike` / `@sentimeter/star-rating`). Full-URL installation
works without namespace configuration. Use
[shadcn's existing MCP integration](https://ui.shadcn.com/docs/mcp); no custom
Sentimeter MCP server is required.

## Work on the Public Site

Use the Bun version declared in `package.json` and Node.js 20.9 or later.

```sh
git clone https://github.com/handshek/sentimeter.git
cd sentimeter
bun install
bun run --cwd apps/web dev
```

Open [localhost:3000](http://localhost:3000). The homepage, catalog, previews,
human docs, and agent docs work without hosted environment variables. See
[CONTRIBUTING.md](CONTRIBUTING.md) and [onboarding](docs/onboarding.md) for checks.

## Optional Hosted Analytics

Hosted Sentimeter analytics remains available through `/dashboard`. Installers
do not need it. To run hosted routes, configure Clerk and Convex using
`apps/web/.env.example` and the [onboarding guide](docs/onboarding.md).
Unconfigured hosted routes return an honest 503; the parked `/widgets` tester
redirects to the catalog. Existing widget documentation URLs still redirect to
their component pages.

## Architecture

- `packages/widgets/src`: canonical widget behavior for workspace previews and installed source.
- `apps/registry`: adapter and Cloudflare Worker serving the shadcn registry.
- `apps/web`: public registry/docs plus optional Clerk/Convex-backed analytics.
- `apps/web/app/_lib/widget-catalog.ts`: public descriptions and examples;
  registry manifest owns installed paths and dependencies.

Generated `.generated` and `public/r` trees are ignored build output. Do not edit
them. See [system architecture](docs/architecture/system-architecture.md) and
[project documentation](docs/README.md) for details.

## Checks and Registry Builds

```sh
bun run test
bun run check-types
bun run lint
bun run build
bun run check-registry
bun run check-docs
```

`check-registry` builds and type-checks installed source in a temporary host.
`registry:emit` emits staging; `registry:build` refreshes ignored public JSON.
Deployment remains a separate maintainer action. `check-env` validates hosted
configuration only; it is not required for public-site development.

## License

[MIT](LICENSE).
