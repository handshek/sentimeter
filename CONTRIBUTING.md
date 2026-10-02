# Contributing to Sentimeter

Small, reviewable contributions are welcome. Start with [CONTEXT.md](CONTEXT.md)
and read [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md) before UI changes.
Follow [AGENTS.md](AGENTS.md) for repository operating rules.

## Run the Public Site

```sh
bun install
bun run --cwd apps/web dev
```

No Clerk or Convex configuration is required for the homepage, catalog, or docs.
See [onboarding](docs/onboarding.md) for optional hosted setup and checks.

## Where Changes Belong

- Widget behavior: `packages/widgets/src`. Do not edit registry staging or JSON.
- Public catalog, install metadata, and examples: `apps/web/app/_lib/widget-catalog.ts`.
  Installed paths and dependencies come from `apps/registry/registry.json`.
- Agent-readable docs: `apps/web/app/_lib/widget-markdown.ts`, derived from that catalog.
- Shared UI primitives: use shadcn components in `packages/ui`.

Keep installed widgets local, theme-aware, keyboard-accessible, and usable in a
288px container with 44×44px reaction targets. Preserve custom/local/hosted
submission precedence and the public API. Discuss new widget types or changes to
the registry footprint in an issue first; this launch focuses on three widgets.

## Before a Pull Request

```sh
bun run test
bun run check-types
bun run lint
bun run build
bun run check-registry
bun run check-docs
```

Use focused behavior tests for meaningful regressions, not snapshots of class
names. For UI changes, also check narrow screens, keyboard use, light/dark
tokens, success/error states, and the exact copied installation command. Include
a short description and relevant screenshots in your PR. Keep commits scoped.

Contributions are licensed under the [MIT License](LICENSE).
