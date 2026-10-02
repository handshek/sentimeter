# System Architecture

Sentimeter is intentionally split into install-time, runtime, and analytics
surfaces.

## Surfaces

### Public Registry and Optional Dashboard (`apps/web`)

The Next.js 16 App Router app owns the widget-led homepage, `/components`
catalog, Getting Started guide, and component documentation. These routes run
without Clerk or Convex providers or hosted environment variables. Component
Markdown endpoints and `/llms.txt` are statically generated from the same catalog.

Clerk is scoped to sign-in/sign-up and hosted routes; Convex clients are created
only inside the dashboard or configured `/widgets` tester. Unconfigured hosted
routes return 503. The tester is parked, not advertised, and redirects to the
catalog when hosted setup is absent. Legacy `/widgets/[slug]` redirects remain.

### Registry (`apps/registry`)

The registry app adapts canonical Widget source into shadcn Registry Items and
serves the built JSON from Cloudflare Workers. Private generated source lives
under `apps/registry/.generated/sentimeter/`; public generated JSON lives under
`apps/registry/public/r/`. Both locations are ignored build output, not authored
Widget behavior.

### Widgets (`packages/widgets`)

The widgets package is the sole canonical source for Widget behavior. The
dashboard imports its workspace form through `@repo/widgets`, while the registry
emitter produces host-local open code from the same source. Submission chooses
a custom `submit` handler first, then hosted HTTP intake for a non-empty `apiKey`,
then local-only completion. Local demos supply neither and do not persist or
send feedback. `endpoint` overrides hosted intake only.

### Convex (`apps/web/convex`)

Convex stores users, projects, API keys, and feedback. Convex queries power the
dashboard. Convex HTTP actions receive public widget submissions.

## Install and Submission Flow

```text
Browse /components -> try a local demo -> shadcn add -> own the installed source
    |
    v
User reacts -> custom submit? -> developer's backend
    |
    +-> otherwise, apiKey? -> optional hosted intake (below)
    |
    +-> neither -> local completion; nothing sent or stored
```

## Optional Hosted Request Flow

```text
Developer creates project
    |
    v
Dashboard creates project + publishable API key in Convex
    |
    v
Developer installs registry item with shadcn add
    |
    v
User reacts in host app widget
    |
    v
Widget POSTs feedback to Convex HTTP action
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
- Agent documentation renderer: `apps/web/app/_lib/widget-markdown.ts`
- Private Registry Item staging: `apps/registry/.generated/sentimeter/`
- Generated registry output: `apps/registry/public/r/`
