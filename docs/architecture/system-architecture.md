# System Architecture

Sentimeter is intentionally split into install-time, runtime, and analytics
surfaces.

## Surfaces

### Dashboard (`apps/web`)

The dashboard is a Next.js 16 App Router app. It owns public marketing/docs
pages, Clerk authentication, the project dashboard, and Convex subscriptions for
realtime feedback analytics.

### Registry (`apps/registry`)

The registry app serves shadcn registry JSON from Cloudflare Workers. Source
components live in `apps/registry/registry/sentimeter/`, and generated JSON lives
under `apps/registry/public/r/`.

### Widgets (`packages/widgets`)

The widgets package contains the React implementations used by the dashboard and
as the source of installable feedback surfaces. Widgets submit feedback through a
small HTTP client that defaults to the production Convex site endpoint and can be
overridden for staging or self-hosted use.

### Convex (`apps/web/convex`)

Convex stores users, projects, API keys, and feedback. Convex queries power the
dashboard. Convex HTTP actions receive public widget submissions.

## Request Flow

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

## Source Of Truth

- Product vocabulary: `CONTEXT.md`
- UI constraints: `DESIGN_PHILOSOPHY.md`
- Data model: `apps/web/convex/schema.ts`
- Feedback rules: `apps/web/convex/lib/feedback-domain.ts`
- Installable components: `apps/registry/registry/sentimeter/`
- Generated registry output: `apps/registry/public/r/`
