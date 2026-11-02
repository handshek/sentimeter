# AGENTS.md

Instructions for coding agents working in this repository. Humans should start
with [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## What this is

Sentimeter is an open-source shadcn registry of accessible React feedback
widgets (emoji, thumbs, stars). Developers install the source with
`shadcn add`; widgets inherit the host theme and save through a host `submit`
handler or complete locally. Hosted analytics (dashboard, Clerk, Convex) is
unreleased: its code lives here but only opens locally with an explicit opt-in.

Read [CONTEXT.md](CONTEXT.md) for domain language before renaming concepts or
changing architecture. Read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) before any UI
change.

## Repository map

```text
apps/
  web/                     Next.js 16 site, docs, design system, waitlist
    app/(site)/            Public routes: /, /components, /design-system, /privacy, /llms.txt
    app/(hosted)/          Unreleased: /dashboard, /sign-in, /sign-up, /widgets lab
    components/            Shared site components (landing, docs, providers)
    lib/                   Widget catalog, Markdown/llms renderers, hosted-mode config
    convex/                Convex backend: waitlist (production) + hosted analytics
  registry/                Cloudflare Worker serving registry JSON
    registry.json          Registry manifest: installed files and dependencies
    scripts/               Adapter that emits packages/widgets into registry items
    site.config.ts         Canonical site, registry, and repository URLs
packages/
  widgets/src/             Canonical widget source (the only place to edit widgets)
  ui/src/                  Vendored shadcn primitives, globals.css, foundations.css
  eslint-config/           Shared ESLint configs
  typescript-config/       Shared tsconfig bases
scripts/                   Repo checks: docs links, env, site/widget design guards
docs/                      Architecture, ADRs, runbook, research
```

Generated output, never hand-edited: `apps/registry/.generated/`,
`apps/registry/public/r/`, and `apps/registry/worker-configuration.d.ts` are
ignored; `apps/web/convex/_generated/` is tracked but written by Convex.

## Commands

Run from the repository root.

| Command                  | Does                                                           |
| ------------------------ | -------------------------------------------------------------- |
| `bun run dev`            | Public site on :3000, no environment needed                    |
| `bun run dev:hosted`     | Site plus `convex dev`; needs `HOSTED_ANALYTICS=live` and keys |
| `bun run lint`           | ESLint across the monorepo                                     |
| `bun run check-types`    | TypeScript across the monorepo                                 |
| `bun run test`           | Unit and component tests                                       |
| `bun run check-design`   | Site and widget design drift guards                            |
| `bun run check-registry` | Temporary shadcn build plus host-fixture type check            |
| `bun run registry:build` | Refresh public registry JSON                                   |
| `bun run check-docs`     | Markdown link check                                            |
| `bun run format`         | Prettier on tracked files (`format:check` in CI)               |
| `bun run build`          | Build registry and site                                        |

Do not start `dev` or `dev:hosted` yourself; assume the user runs the dev loop.

## Rules

1. Edit widget behavior only in `packages/widgets/src`. Run
   `bun run check-registry` after widget or manifest changes.
2. Public widget copy, defaults, and examples live in
   `apps/web/lib/widget-catalog.ts`. Installed files and dependencies come from
   `apps/registry/registry.json`; don't duplicate them.
3. Use shadcn primitives from `packages/ui` and `lucide-react` icons. Install a
   missing shadcn component rather than hand-rolling a primitive or SVG.
4. Widgets stay usable in a 288px container with 44×44px reaction targets,
   keyboard-accessible, and theme-aware. Preserve the public widget API.
5. Imports outside a file's own folder use the `@/` alias in `apps/web`.
6. Convex files are camelCase (`httpActions.ts`) because module names become API
   paths. Everything else is kebab-case. Tests sit next to code as `*.test.ts(x)`.
7. Hosted routes must stay closed unless `HOSTED_ANALYTICS=live` is set with
   Clerk and Convex keys (`apps/web/lib/hosted-config.ts`). Never connect local
   work to live hosted data.
8. If a step needs an interactive login, CLI prompt, or browser authorization,
   stop and ask the user to run it.
9. Only Sentimeter-specific agent skills are committed, under `.agents/skills/`.
   Keep general-purpose skills in your own global skill library.
10. Write commits as `type(scope): summary` (feat, fix, refactor, docs, test,
    build, ci, chore).
