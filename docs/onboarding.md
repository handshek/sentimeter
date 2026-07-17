# Sentimeter Onboarding

## Repository Shape

- `apps/web` - Next.js dashboard, public pages, Clerk auth, Convex functions, and
  widget documentation pages.
- `apps/registry` - Cloudflare Worker plus shadcn registry source and generated
  JSON.
- `packages/widgets` - reusable open-code widget implementations.
- `packages/ui` - shared shadcn/ui primitives.

## First Read

1. Read `CONTEXT.md` for domain language.
2. Read `DESIGN_PHILOSOPHY.md` before UI work.
3. Read `apps/web/convex/schema.ts` to understand stored data.
4. Read `apps/registry/registry.json` before changing registry items.
5. Read `packages/widgets/src/types.ts` and `packages/widgets/src/core/submit.ts`
   before changing widget submission behavior.

## Local Commands

- `bun run check-env` - verify local environment variables are shaped correctly.
- `bun run lint` - lint the monorepo.
- `bun run check-types` - type-check the monorepo.
- `bun run test` - run local unit tests.
- `bun run registry:build` - regenerate shadcn registry JSON.

Do not run `bun run dev` from agent sessions; assume the development loop is
already running unless the user says otherwise.

## Change Heuristics

- Feedback-intake changes should usually touch `apps/web/convex/lib` tests.
- Widget-behavior changes should usually touch `packages/widgets/src/core`
  tests.
- Registry-source changes usually require `bun run registry:build`.
