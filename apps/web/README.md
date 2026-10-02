# Sentimeter Web

Next.js 16 public widget catalog and documentation, with optional hosted analytics.
From the repository root:

```sh
bun install
bun run --cwd apps/web dev
```

The public site needs no Clerk or Convex environment variables. Hosted dashboard,
authentication, and the parked widget lab require the configuration described in
[onboarding](../../docs/onboarding.md). Hosted providers are scoped to those routes.

See the [project README](../../README.md), [contribution guide](../../CONTRIBUTING.md),
and [design philosophy](../../DESIGN_PHILOSOPHY.md).
