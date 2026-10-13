# Sentimeter Runbook

## Quick checks

Run these from the repo root:

```bash
bun run check-env
bun run check-docs
bun run check-registry
bun run check-design
bun run check-tests
bun run lint
bun run check-types
bun run test
bun run build
```

Do not run `bun run dev` from agent sessions unless the user explicitly asks.

`check-env` checks development hosted configuration. The public registry needs
no hosted variables. `WAITLIST_SECRET` and `HOSTED_ANALYTICS` are optional for
that check.

## Launch deployment

These are maintainer steps. Local implementation does not change production,
provider settings, GitHub secrets, or DNS. Complete any interactive login,
consent, or project selection yourself.

### Domain switch

Keep the current hosts until the purchased domain is ready. Canonical values
live in [site.config.ts](../../apps/registry/site.config.ts). There is no custom
domain route in Wrangler yet.

1. In Cloudflare, open **Domain Registration → Register Domains**, search for
   the chosen domain, and complete its purchase. Keep its DNS zone in the same
   account as the registry Worker.
2. In the Vercel project, open **Settings → Domains → Add Domain** and add the
   apex. Copy the exact DNS record Vercel shows for this project. In Cloudflare
   **DNS → Records → Add record**, add it with **DNS only**. If Vercel supplies
   an apex CNAME, Cloudflare flattens it. Wait for Vercel's valid-configuration
   status; do not assume a generic Vercel DNS target.
3. Set `SITE_URL` to `https://<domain>` and `REGISTRY_URL` to
   `https://registry.<domain>` in `site.config.ts`. Keep `REPOSITORY_URL` as the
   GitHub repository. Supply `LEGAL_CONTACT_EMAIL` before launch. Until then,
   privacy requests link to the repository's issues page.
4. Add this field to [wrangler.json](../../apps/registry/wrangler.json), replacing
   the example hostname:

   ```json
   "routes": [{ "pattern": "registry.<domain>", "custom_domain": true }]
   ```

   The Worker Custom Domain manages DNS and TLS. Do not create a registry CNAME
   to Vercel; remove a conflicting registry record if one exists.

5. Refresh the copied hosts in the root and registry READMEs. Run
   `bun run registry:emit`, `bun run registry:build`, and `bun run check-registry`.
   Generated dependency URLs must use the new registry hostname. Run the full
   checks and commit `site.config.ts`, the refreshed tracked `registry.json`,
   routing configuration, and copied examples. Staging and public JSON stay
   ignored.
6. Deploy the Worker and site using the flows below. Keep the existing Worker
   name and `workers.dev` endpoint available during transition; existing
   installs may still use them. Verify both hosts over HTTPS and a fresh install.
7. After the stable endpoint works, prepare the shadcn directory entry
   `"@sentimeter": "https://registry.<domain>/r/{name}.json"`. The maintainer
   approves and submits it and publishes launch posts. Local drafts stay in
   ignored `.notes/launch/`.

### Registry CI secrets

1. In Cloudflare, open **My Profile → API Tokens → Create Token** and use
   **Edit Cloudflare Workers**, scoped to the intended account. Include zone
   access for the purchased domain when configuring its Worker Custom Domain.
2. Copy the account ID from **Workers & Pages**.
3. In GitHub, open **Settings → Secrets and variables → Actions → New repository
   secret** and add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. The `deploy-registry` job in [ci.yml](../../.github/workflows/ci.yml) runs after
   `verify` only on pushes to `master`. Pull requests verify and build without
   deploying. Missing secrets make the deploy fail visibly.

### Convex production and Vercel

1. In the existing Convex project's dashboard, create or select production and
   confirm its deployment name. Copy its URL and generate a production deploy
   key from **Settings → Deploy Keys**.
2. Generate one private random `WAITLIST_SECRET`. In the selected production
   deployment's **Settings → Environment Variables**, set `WAITLIST_SECRET`
   and `CLERK_JWT_ISSUER_DOMAIN`. The issuer is required by
   [auth.config.ts](../../apps/web/convex/auth.config.ts) even while analytics is
   gated. The existing development Clerk issuer is acceptable for this launch;
   use its full `https://…` URL.
3. In Vercel **Settings → Environment Variables**, select **Production** and set
   `CONVEX_DEPLOY_KEY`, `NEXT_PUBLIC_CONVEX_URL`, and the matching
   `WAITLIST_SECRET`. Leave `HOSTED_ANALYTICS` unset. Clerk web keys and
   `NEXT_PUBLIC_CONVEX_SITE_URL` are unnecessary for the production waitlist.
   Keep preview deployment credentials separate from production.
4. Confirm **Settings → Build and Deployment → Root Directory** is `apps/web`.
   The committed [vercel.json](../../apps/web/vercel.json) uses
   `npx convex deploy --cmd 'bun run build'`. Keep any dashboard build override
   consistent with it. This deployment command builds the site for the selected
   backend and pushes Convex functions, indexes, and schema using the deploy
   key. It is not a local verification command.
5. Deploy the reviewed Git commit. Check the Vercel build log and Convex schema
   and function updates. Environment changes require a fresh Vercel deployment.
6. In the project's **Analytics** tab, select **Enable** for Web Analytics. The
   installed Analytics component still needs this provider setting. See
   [Vercel's setup guide](https://vercel.com/docs/analytics/quickstart).

Refer to [Convex's Vercel guide](https://docs.convex.dev/production/hosting/vercel)
and [Worker Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
for provider details. Never commit deploy keys or put private secrets in public
environment variables.

### Manual registry redeploy

After checks pass, an authenticated maintainer can run from the repo root:

```bash
bun run registry:build
bun run --cwd apps/registry deploy
```

Use the same Cloudflare account as CI. Complete authentication yourself first
if needed. Rebuild before deploying because Wrangler serves the ignored local
`public/r` contents.

### Launch verification

1. Confirm production `/dashboard` shows the form without Clerk. Sign-in,
   sign-up, and dashboard project subpaths redirect there; `/widgets` redirects
   to `/components`.
2. Submit a fresh email and inspect production `waitlist` data. A duplicate
   succeeds with one row. Six attempts from one IP in an hour reach its limit;
   the global limit is 300 per hour. A filled honeypot inserts nothing.
3. Check the 404, privacy contact, sitemap, robots, Open Graph and Twitter
   metadata/images, icons, and Analytics script. Inspect narrow and desktop
   screens in both themes.
4. Install registry items in a fresh shadcn project and verify local completion
   and a custom handler. Published widget source must have no hosted endpoint
   or project-key integration.

## Registry JSON looks stale

1. Check canonical source under `packages/widgets/src/` and the explicit file
   map in `apps/registry/registry.json`.
2. Run `bun run check-registry` to validate ignored staging, a temporary shadcn
   build, and the reconstructed host tree.
3. Run `bun run registry:build` to atomically refresh public JSON.
4. Inspect generated files under `apps/registry/public/r/`.
5. Confirm registry dependencies use full URLs when host projects need zero
   extra `components.json` configuration.

## Widgets are not recording feedback

1. Confirm a custom `submit` handler is configured. Without one, the widget
   completes locally and sends or stores nothing.
2. Check that the handler awaits persistence and throws when saving fails.
3. Inspect the host backend and handler errors. Published widgets do not select
   a hosted endpoint or accept a project key.

For **unreleased hosted analytics, dev only**, use the configured `/widgets`
tester. Its helper reads `NEXT_PUBLIC_CONVEX_SITE_URL`. Confirm the project key
and allowed origins in the development dashboard, then inspect HTTP responses
for `401 invalid_key`, `403 origin_not_allowed`, `429 rate_limited`, or
`400 invalid_value`. Follow [feedback intake](../architecture/feedback-intake.md)
for the validation order.

## Waitlist is unavailable

1. Confirm the web deployment has `NEXT_PUBLIC_CONVEX_URL` and `WAITLIST_SECRET`,
   and its secret matches the selected Convex deployment.
2. Confirm that backend has `waitlist.join` and its schema/index deployed.
3. Inspect server and Convex logs without copying secrets into issues. Invalid
   emails and rate limits are expected form states; deployment or secret
   mismatches need a maintainer fix.
4. To handle removal requests, locate the normalized email in the correct
   deployment's `waitlist` table and delete the row. Verify deletion before
   reporting success. Requests use the privacy page's email or GitHub issue link.

## Development dashboard auth looks broken

1. Confirm Clerk publishable and secret keys are present.
2. Confirm `CLERK_JWT_ISSUER_DOMAIN` is configured in Convex.
3. Check `apps/web/convex/users.ts` and `apps/web/convex/lib/auth.ts` if users
   authenticate but do not sync.
4. Confirm the Clerk **JWT templates** page has the `convex` template and its
   issuer matches Convex configuration. Do not enable production hosted
   analytics to troubleshoot the waitlist.
