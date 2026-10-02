# Sentimeter Onboarding

## Repository Shape

- `apps/web` - public widget catalog and docs, plus optional Clerk/Convex analytics.
- `apps/registry` - Cloudflare Worker plus the private Registry Item Adapter and
  generated JSON.
- `packages/widgets` - canonical reusable open-code Widget implementations.
- `packages/ui` - shared shadcn/ui primitives.

## First Read

1. Read `CONTEXT.md` for domain language.
2. Read `DESIGN_PHILOSOPHY.md` before UI work.
3. Read `apps/web/convex/schema.ts` to understand stored data.
4. Read `apps/registry/registry.json` before changing Registry Item shape.
5. Read `packages/widgets/src/feedback-system.ts`, `types.ts`, and
   `core/submit.ts` before changing Widget behavior.

## Local Commands

For human contributors, `bun install` followed by `bun run --cwd apps/web dev`
starts the public site without hosted setup. Use Node.js 20.9+ and the repo's Bun
version. No `.env.local` is needed to work on the homepage, catalog, previews,
Markdown, or `llms.txt`.

### Optional Hosted Setup

1. Configure a Convex project and a Clerk app in their dashboards.
2. Copy `apps/web/.env.example` to `.env.local` and replace the placeholders.
   Hosted routes require `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
   and `NEXT_PUBLIC_CONVEX_URL`; the site URL configures HTTP intake tooling.
3. Set `CLERK_JWT_ISSUER_DOMAIN` in Convex to your Clerk Frontend API origin and
   configure the Clerk JWT template named `convex`.
4. Run `bun run check-env`. Human contributors can start the full development
   loop with `bun run dev`; perform any login or project-selection prompt yourself.

Clerk and Convex providers do not mount on public registry pages. Without hosted
setup, protected routes return 503 and `/widgets` redirects to `/components`.
The existing Advanced tester remains for configured integrations, not public discovery.

### Checks

- `bun run check-env` - verify optional hosted environment variables.
- `bun run lint` - lint the monorepo.
- `bun run check-types` - type-check the monorepo.
- `bun run test` - run local unit tests.
- `bun run registry:emit` - materialize ignored Registry Item staging.
- `bun run check-registry` - validate a temporary shadcn build and host fixture.
- `bun run registry:build` - atomically refresh public shadcn registry JSON.
- `bun run check-docs` - validate local Markdown links.

Do not run `bun run dev` from agent sessions; assume the development loop is
already running unless the user says otherwise.

## Change Heuristics

- Feedback-intake changes should usually touch `apps/web/convex/lib` tests.
- Widget-behavior changes should usually touch `packages/widgets/src/core`
  tests.
- Widget-source or Registry Item manifest changes require
  `bun run check-registry`; run `bun run registry:build` when public JSON should
  be refreshed.
- Public widget descriptions, defaults, examples, and props live in the Widget
  Catalog. Do not duplicate installed file counts or dependencies; read the manifest.
- Add only focused regression tests. Use browser checks for responsive UI and
  keyboard behavior; end-to-end infrastructure is deferred.
