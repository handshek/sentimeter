# Contributing to Sentimeter

Small, reviewable contributions are welcome. Start with [CONTEXT.md](CONTEXT.md)
and read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) before UI changes.
[AGENTS.md](AGENTS.md) has the repository map and project rules.

## Run the Public Site

You need [Bun](https://bun.sh) (the version in `package.json`) and Node.js 20
(see `.nvmrc`).

```sh
git clone https://github.com/handshek/sentimeter.git
cd sentimeter
bun install
bun run dev
```

Open [localhost:3000](http://localhost:3000).

No Clerk or Convex configuration is required for the homepage, catalog, or docs.
See [onboarding](docs/onboarding.md) for unreleased hosted development setup and
checks.

## Where Changes Belong

- Widget behavior: `packages/widgets/src`. Do not edit registry staging or JSON.
- Public catalog, install metadata, and examples: `apps/web/lib/widget-catalog.ts`.
  Installed paths and dependencies come from `apps/registry/registry.json`.
- Agent-readable docs: `apps/web/lib/widget-markdown.ts`, derived from that catalog.
- Shared UI primitives: use shadcn components in `packages/ui`.

Keep installed widgets local, theme-aware, keyboard-accessible, and usable in a
288px container with 44×44px reaction targets. A custom `submit` handler saves
feedback; without it, the widget completes locally. Preserve that behavior and
the public API. Discuss new widget types or changes to
the registry footprint in an issue first; this launch focuses on three widgets.

## Adding a Widget

Open an issue first; the registry footprint is part of the public contract.
Then touch these places, in order:

1. `packages/widgets/src/<slug>.tsx` - the wrapper, built from the compound
   parts in `src/compound`. Export it from `src/index.ts` and add behavior tests.
2. `apps/registry/scripts/registry-plan.ts` - add the source mapping, the item
   name to the `item` union, and the registry item.
3. `apps/registry/registry.json` - add the matching manifest entry, then run
   `bun run check-registry`.
4. `apps/web/lib/widget-catalog.ts` - add the slug to `WidgetSlug` and a
   `widgetDefinitions` entry; the docs page, Markdown endpoint, and `llms.txt` follow.
5. Previews: `components/docs/widget-demo.tsx`,
   `components/landing/widget-specimen.tsx`, and the design-system widget
   specimens in `apps/web`.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org):
`type(scope): summary`, with types `feat`, `fix`, `refactor`, `docs`, `test`,
`build`, `ci`, or `chore`. Small commits are easier to review.

## Before a Pull Request

```sh
bun run test
bun run check-types
bun run lint
bun run build
bun run check-registry
bun run check-design
bun run check-docs
```

Use focused behavior tests for meaningful regressions, not snapshots of class
names. For UI changes, also check narrow screens, keyboard use, light/dark
tokens, success/error states, and the exact copied installation command. Include
a short description and relevant screenshots in your PR. Keep commits scoped.

Contributions are licensed under the [MIT License](LICENSE).
