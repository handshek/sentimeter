# System Architecture

Sentimeter launches as an open-source widget registry. Hosted sections below
describe **unreleased hosted analytics, dev only**. The production dashboard is
a coming-soon page with an optional waitlist.

## Surfaces

### Public registry and development dashboard (`apps/web`)

The Next.js 16 App Router app owns the widget-led homepage, `/components`
catalog, Getting Started guide, and component documentation. These routes run
without Clerk or Convex providers or hosted environment variables. Component
Markdown endpoints and `/llms.txt` are statically generated from the same catalog.

In live mode, Clerk is scoped to sign-in/sign-up and hosted routes; Convex
clients are created only inside the dashboard or configured `/widgets` tester.
Live mode requires the explicit `HOSTED_ANALYTICS=live` opt-in plus Clerk and
Convex configuration in every environment; production leaves it unset.

Otherwise, production shows the waitlist when `NEXT_PUBLIC_CONVEX_URL` and
`WAITLIST_SECRET` are set, or the same coming-soon page without a form. Sign-in and dashboard project
routes redirect to `/dashboard`; `/widgets` redirects to the catalog. Legacy
widget documentation redirects remain. Public specimens always complete locally.

### Registry (`apps/registry`)

The registry app adapts canonical Widget source into shadcn Registry Items and
serves the built JSON from Cloudflare Workers. Private generated source lives
under `apps/registry/.generated/sentimeter/`; public generated JSON lives under
`apps/registry/public/r/`. Both locations are ignored build output, not authored
Widget behavior.

### Widgets (`packages/widgets`)

The widgets package is the sole canonical source for Widget behavior. The
site imports its workspace form through `@repo/widgets`, while the registry
emitter produces host-local open code from the same source. Submission chooses
a custom `submit` handler, or local completion when no handler is supplied.
Published widgets contain no project-key or hosted-endpoint integration. Local
demos do not persist or send feedback.

### Convex (`apps/web/convex`)

Convex stores public waitlist signups. A Next.js server action calls the
shared-secret-protected `waitlist.join` mutation after checking the honeypot.
The mutation validates emails, applies per-IP and global limits, and returns
quiet success for duplicate emails.

For unreleased hosted analytics in development, Convex stores users, projects,
API keys, and feedback. Queries power the dashboard. HTTP actions receive
submissions from the internal tester's custom handler, whose URL comes from
`NEXT_PUBLIC_CONVEX_SITE_URL`.

## Install and Submission Flow

```text
Browse /components -> try a local demo -> shadcn add -> own the installed source
    |
    v
User reacts -> custom submit? -> developer's backend
    |
    +-> no submit handler -> local completion; nothing sent or stored
```

## Unreleased hosted request flow, dev only

```text
Developer creates project
    |
    v
Dashboard creates project + publishable API key in Convex
    |
    v
Developer opens the configured internal /widgets tester
    |
    v
User reacts in the tester widget
    |
    v
Tester custom submit handler POSTs feedback to Convex HTTP action
    |
    v
Convex validates key, origin, value, and rate limits
    |
    v
Feedback row is stored
    |
    v
Dashboard realtime queries update analytics
```

## Registry Item Generation

Registry generation is one-way:

```text
packages/widgets/src
    |
    | bun run registry:emit
    v
apps/registry/.generated/sentimeter
    |
    | bun run registry:build
    v
apps/registry/public/r
```

The emitted shared tree begins at `feedback-system/index.ts` and retains
modular `core`, `compound`, and type files. Preset files sit beside that
directory. Their imports use host-local shadcn paths, and imports such as
`./feedback-system` remain directory-resolved through the emitted `index.ts`.

The private staging tree must never be edited directly. `registry:check`
refreshes ignored staging, builds JSON in a temporary directory, validates
manifest/content parity, and type-checks a temporary host. It does not replace
the public output.

## Source Of Truth

- Product vocabulary: `CONTEXT.md`
- UI constraints: `DESIGN_PHILOSOPHY.md`
- Data model: `apps/web/convex/schema.ts`
- Feedback rules: `apps/web/convex/lib/feedbackDomain.ts`
- Canonical Widget behavior: `packages/widgets/src/`
- Public Widget Catalog and examples: `apps/web/app/_lib/widget-catalog.ts`
- Installed files and dependencies: `apps/registry/registry.json`
- Public hosts and legal contact: `apps/registry/site.config.ts`
- Agent documentation renderer: `apps/web/app/_lib/widget-markdown.ts`
- Private Registry Item staging: `apps/registry/.generated/sentimeter/`
- Generated registry output: `apps/registry/public/r/`
