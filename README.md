# Sentimeter

Open-source feedback widgets for shadcn apps. Install accessible React source,
match your app's theme, and connect your own backend. No account required.

[Browse widgets](https://try-sentimeter.vercel.app/components) ·
[Getting started](https://try-sentimeter.vercel.app/components/getting-started) ·
[Design system](https://try-sentimeter.vercel.app/design-system) ·
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
succeeds and throw on failure. The payload contains `widgetType`, `value`,
optional `text`, and `location`. Without a handler, submission completes locally.

Installation adds 1 widget wrapper + 14 shared feedback-system files, using your
local shadcn Button, Textarea, Label, utilities, and theme tokens plus `lucide-react`.
You own the installed source; no runtime Sentimeter package or iframe is needed.

## Design System

Sentimeter's [design system](https://try-sentimeter.vercel.app/design-system)
covers the whole product: typography, semantic light/dark
colors, spacing, surfaces, icons, motion, component states, and complete page
patterns. The website and docs share these coded foundations. Explore the live
specimens or read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for source ownership and
the contribution contract.

For installed feedback widgets, the host remains in control of its global theme.
The widget inherits your app’s colors, font, and radius. Pick the stacked card
or the inline bar, and swap in your own glyphs:

```tsx
<EmojiFeedback layout="inline" showInput autoHide={false} />
<StarRating glyph={{ glyph: "❤️", label: "heart" }} />
```

The widget downloads no fonts and ships no stylesheet.

The installed `feedback-system/design-system.ts` owns the recipes. Use typed
`FeedbackStyle` overrides through the `style` prop for local `--feedback-*`
tokens, or reuse the compound components for a new widget composition. See the
[widget design reference](https://try-sentimeter.vercel.app/design-system/widgets)
for examples and the composition contract.

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

## Hosted analytics is coming

The public release is the widget registry. Hosted analytics is unreleased and
available for development only. The production `/dashboard` page offers a
waitlist when its Convex URL and secret are configured. Sign-in and project
routes redirect there; `/widgets` redirects to the catalog.

To develop the hosted dashboard, configure Clerk and Convex using
[apps/web/.env.example](apps/web/.env.example) and the
[onboarding guide](docs/onboarding.md). Installed widgets submit through your
own handler or complete locally.

## Architecture

- `packages/widgets/src`: canonical widget behavior for workspace previews and installed source.
- `apps/registry`: adapter and Cloudflare Worker serving the shadcn registry.
- `apps/web`: public registry/docs, production waitlist, and unreleased hosted
  analytics for development.
- `apps/web/app/_lib/widget-catalog.ts`: public descriptions and examples;
  registry manifest owns installed paths and dependencies.

Generated `.generated` and `public/r` trees are ignored build output. Do not edit
them. See [system architecture](docs/architecture/system-architecture.md) and
[project documentation](docs/README.md) for details.

The links and install commands above use the current hosts from
[apps/registry/site.config.ts](apps/registry/site.config.ts). Domain changes start
there; follow the [deployment runbook](docs/ops/runbook.md) to update routing,
regenerate the registry, and refresh these examples.

## Checks and Registry Builds

```sh
bun run test
bun run check-tests
bun run check-types
bun run lint
bun run build
bun run check-registry
bun run check-design
bun run check-docs
```

`check-registry` builds and type-checks installed source in a temporary host.
`registry:emit` emits staging; `registry:build` refreshes ignored public JSON.
The registry deploys after verified pushes to `master`; Vercel Git deployments
build the site and deploy Convex. Configure their secrets before enabling the
launch deploys using the [runbook](docs/ops/runbook.md). `check-env` validates
development hosted configuration; it is not required for public-site work.

## License

[MIT](LICENSE).
