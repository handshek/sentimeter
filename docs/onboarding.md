# Sentimeter Onboarding

## Repository Shape

- `apps/web` - public widget catalog, docs, production waitlist, and unreleased
  hosted analytics. Public routes live in `app/(site)`, hosted ones in
  `app/(hosted)`; shared code is in `components/` and `lib/`.
- `apps/registry` - Cloudflare Worker plus the private Registry Item Adapter and
  generated JSON.
- `packages/widgets` - canonical reusable open-code Widget implementations.
- `packages/ui` - shared shadcn/ui primitives.

## First Read

1. Read `CONTEXT.md` for domain language.
2. Read `DESIGN_SYSTEM.md` before UI work.
3. Read `apps/registry/registry.json` before changing Registry Item shape.
4. Read `packages/widgets/src/feedback-system.ts`, `types.ts`, and
   `core/errors.ts` before changing Widget behavior.
5. For hosted work only, read `apps/web/convex/schema.ts` for stored data.

## Local Commands

For human contributors, `bun install` followed by `bun run dev`
starts the public site without hosted setup. Use Node.js 20.9+ and the repo's Bun
version. No `.env.local` is needed to work on the homepage, catalog, previews,
Markdown, or `llms.txt`.

### Unreleased hosted analytics setup, dev only

1. Configure a Convex project and a Clerk app in their dashboards.
2. Copy `apps/web/.env.example` to `.env.local` and replace the placeholders.
   Hosted routes require `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
   and `NEXT_PUBLIC_CONVEX_URL`; the site URL configures HTTP intake tooling.
3. Set `CLERK_JWT_ISSUER_DOMAIN` in Convex to your Clerk Frontend API origin and
   configure the Clerk JWT template named `convex`.
4. Add `HOSTED_ANALYTICS=live` to `apps/web/.env.local`. Hosted routes stay
   closed without it, even when the keys are present.
5. Run `bun run check-env`, then `bun run dev:hosted` to start Next.js and
   `convex dev` together; perform any login or project-selection prompt yourself.

Clerk and Convex providers do not mount on public registry pages. With the opt-in,
the dashboard, sign-in, and Advanced tester work. Without hosted
configuration, `/dashboard` shows the coming-soon page without an email form.
Sign-in, sign-up and dashboard project subpaths redirect there; `/widgets`
redirects to `/components`.

Production defaults to the waitlist when `NEXT_PUBLIC_CONVEX_URL` and
`WAITLIST_SECRET` are set, or to the same coming-soon page without a form otherwise. `WAITLIST_SECRET`
must match in the web app and Convex deployment. It is optional for development
hosted analytics and `check-env`. Leave `HOSTED_ANALYTICS` unset in production
for the registry release. Follow the [runbook](ops/runbook.md) for launch setup.

### Checks

- `bun run check-env` - verify optional hosted environment variables.
- `bun run lint` - lint the monorepo.
- `bun run check-types` - type-check the monorepo.
- `bun run test` - run local unit tests.
- `bun run check-design` - run site and widget design guards.
- `bun run build` - build the registry and public site.
- `bun run registry:emit` - materialize ignored Registry Item staging.
- `bun run check-registry` - validate a temporary shadcn build and host fixture.
- `bun run registry:build` - atomically refresh public shadcn registry JSON.
- `bun run check-docs` - validate local Markdown links.

Do not run `bun run dev` or `bun run dev:hosted` from agent sessions; assume the development loop is
already running unless the user says otherwise.

## Change Heuristics

- Feedback-intake changes should usually touch `apps/web/convex/lib` tests.
- Widget-behavior changes should usually touch the behavior tests in
  `packages/widgets/src/*.test.tsx`.
- Widget-source or Registry Item manifest changes require
  `bun run check-registry`; run `bun run registry:build` when public JSON should
  be refreshed.
- Public widget descriptions, defaults, examples, and props live in the Widget
  Catalog. Do not duplicate installed file counts or dependencies; read the manifest.
- Add only focused regression tests. Use browser checks for responsive UI and
  keyboard behavior; end-to-end infrastructure is deferred.
