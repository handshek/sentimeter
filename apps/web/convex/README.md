# Sentimeter Convex backend

Convex stores the public hosted-analytics waitlist and the unreleased hosted
analytics data used during development. Published registry widgets complete
locally or call a host-supplied `submit` handler; they do not call this backend.

## Tables

The canonical schema is [schema.ts](schema.ts).

- `waitlist` holds normalized email, signup time, and source, indexed by email.
- `users` maps Clerk identities to local users.
- `projects` holds user-owned projects, development/production mode, and allowed
  browser origins.
- `apiKeys` holds publishable project keys and revocation times.
- `feedback` holds ratings, comments, locations, and submission times.

The last four tables belong to unreleased hosted analytics, dev only.

## Functions

- `waitlist.join` verifies a private shared secret, validates email, applies
  per-IP and global limits, and succeeds quietly for duplicate emails.
  The site calls it through a Next.js server action.
- `users.syncUser` synchronizes the authenticated Clerk identity.
- `projects` provides authenticated project/key/origin management.
- `feedback` stores hosted submissions internally and provides authenticated
  feedback, analytics, and volume queries.
- `http` and `httpActions` expose development hosted intake with CORS and
  project-key, origin, payload, and rate checks.

Pure validation rules and rate-limit configuration live in `lib/`. The
`@convex-dev/rate-limiter` component is registered in `convex.config.ts`.
`_generated/` contains Convex-generated API bindings; regenerate those with the
Convex CLI rather than editing them manually.

## Configuration and deployment

Development hosted analytics uses the optional values in
[../.env.example](../.env.example). Convex requires `CLERK_JWT_ISSUER_DOMAIN` for
its auth provider. Waitlist requests require `WAITLIST_SECRET` to match the web
app's private value.

Use `bunx convex dev --once` from `apps/web` for an already configured
development deployment. Complete any interactive setup yourself first.
Vercel deploys Convex only when `VERCEL_ENV=production` and `CONVEX_DEPLOY_KEY`
is non-empty. Other builds run `bun run build` without deploying Convex. Follow
the [runbook](../../../docs/ops/runbook.md) before changing production
configuration or deployment.
