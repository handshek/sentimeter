# Sentimeter Runbook

## Quick Checks

Run these from the repo root:

```bash
bun run check-env
bun run check-docs
bun run check-registry
bun run lint
bun run check-types
bun run test
```

Do not run `bun run dev` from agent sessions unless the user explicitly asks.

## Registry JSON Looks Stale

1. Check canonical source under `packages/widgets/src/` and the explicit file
   map in `apps/registry/registry.json`.
2. Run `bun run check-registry` to validate ignored staging, a temporary shadcn
   build, and the reconstructed host tree.
3. Run `bun run registry:build` to atomically refresh public JSON.
4. Inspect generated files under `apps/registry/public/r/`.
5. Confirm registry dependencies use full URLs when host projects need zero
   extra `components.json` configuration.

## Widgets Are Not Recording Feedback

1. Confirm the widget has a publishable API key.
2. Confirm the endpoint is the expected Convex site URL or an intentional
   override.
3. Check project allowed origins in the dashboard.
4. Check whether HTTP responses are `401 invalid_key`, `403 origin_not_allowed`,
   `429 rate_limited`, or `400 invalid_value`.
5. Use `docs/architecture/feedback-intake.md` to follow the validation order.

## Dashboard Auth Looks Broken

1. Confirm Clerk publishable and secret keys are present.
2. Confirm `CLERK_JWT_ISSUER_DOMAIN` is configured in Convex.
3. Check `apps/web/convex/users.ts` and `apps/web/convex/lib/auth.ts` if users
   authenticate but do not sync.
