# Repository structure audit

Dated 2026-10-28. Compares Sentimeter's repository layout, local setup, agent
files and contributor process against
[shadcn-ui/ui](https://github.com/shadcn-ui/ui), then lists the improvements as
four pull requests. Paths are relative to the repository root at the time of the
audit; later PRs move some of them.

Decisions: unreleased hosted analytics code stays in the repository but is only
reachable through an explicit local opt-in; only Sentimeter-specific agent
skills are tracked; contributor process stays low-friction.

## What shadcn does that we'll copy


- The root holds only config and core docs. Generated output is gitignored and explained by a README in that folder.
- Every app and package has a README.
- Files are kebab-case throughout. Tests are colocated as `*.test.ts`.
- Script names are predictable: `<pkg>:dev`, `<pkg>:build`, `check`.
- `CONTRIBUTING.md` gives exact setup steps, an "adding a component" checklist and commit conventions. `.nvmrc` pins Node, and `packageManager` pins the package manager.
- `.github/` has YAML issue forms (blank issues off), dependabot, a lean CI and `FUNDING.yml`.
- Root files: `SECURITY.md` (GitHub private vulnerability reporting), `LICENSE.md`, `.editorconfig`, `.vscode/settings.json` (search excludes for generated folders), and a prettier config with format:check in CI.
- Agent files: `AGENTS.md` plus a `CLAUDE.md` containing `@AGENTS.md`, `llms.txt`, project-specific `skills/` only, and `.claude/launch.json`.
- Where shadcn falls short: its docs have drifted (stale CONTRIBUTING tree, a non-existent script). We should add a check so ours can't drift.

## Findings (what's wrong in Sentimeter today)

### A. Local setup friction (highest impact)
1. Root `bun run dev` runs `turbo --filter=web`. In `turbo.json`, `web#dev.with: ["web#dev:convex"]` also starts `convex dev`, which needs a Convex login. So the first command a newcomer runs fails.
2. Hosted mode currently turns itself on in dev whenever Clerk and Convex keys exist (`apps/web/app/_lib/hosted-config.ts:resolveHostedMode`). There is no explicit opt-in.
3. `.env.example` is missing `CLERK_JWT_ISSUER_DOMAIN`, and it disagrees with other docs about `bunx` vs `npx`. There is also a stray root `.env.local`.
4. Version pinning is incomplete:
   - There is no `.nvmrc`.
   - CI hard-codes `bun-version: 1.3.9` twice instead of reading it from `packageManager`.
   - `.npmrc` is empty.
5. `bun run check-docs` fails locally with 218 errors, because `scripts/check-docs.ts` walks untracked folders (`.design-system/`, `.notes/`, and the 544 MB `.npm-cache`). It passes in CI only because those folders don't exist there.
6. `turbo.json` repeats the Clerk/Convex env lists across `build` and `web#build`. It also passes through `SENTIMETER_POLISH_FIXTURES_DIR`, which only one test uses.

### B. Root clutter and untracked junk
7. `.design-system/` (37 MB), `sentimeter-pencil-test.pen`, `public/r/` (empty), `apps/registry/registry/sentimeter/` (empty), `apps/registry/.tmp/` and `apps/web/app/lib/` (empty) are not ignored. `design/` is ignored only through the local `.git/info/exclude`.
8. `.gitignore` still lists TestSprite paths, and the root `.vercel/` is redundant.
9. `docs/qa/issue-{17,19,20,21}/` holds 52 tracked files: about 884 KB of JPGs, logs and JSON. It is evidence for the hosted dashboard that nothing links to.
10. There are 8 root Markdown files with overlapping content:
    - `DESIGN_PHILOSOPHY.md` and `DESIGN_SYSTEM.md` both say "read before UI work".
    - `DESIGN_PHILOSOPHY.md:32` still describes API keys and endpoint overrides.

### C. Agent-facing files
11. `AGENTS.md` is stale:
    - The tree at L69–245 lists files that no longer exist and leaves out real ones. It ends with leftover export legend lines.
    - It presents Clerk and Convex as the core stack.
    - It includes a personal rule ("use Context7 when I need…").
    - It says not to write custom UI components, but the repo has many.
    - It describes `bun run dev` wrongly.
12. There is no `CLAUDE.md`, so Claude Code never loads `AGENTS.md`.
13. `.agents/skills` tracks 14 skills. All are generic or third-party; even `state-machine` comes from `jakubkrehel/skills`. `skills-lock.json` lists only one of them. Under the user's rule, none of the current skills qualify as project-specific. Sentimeter-specific skills (design philosophy, widget authoring) can be added later.

### D. Code layout and navigability
14. `apps/web/app/components/` is a public route (`/components`) that also holds app-wide providers (`convex-clerk-provider.tsx`, `hosted-providers.tsx`, `toaster-provider.tsx`). That gives both `app/components/_components` and `app/_components`, plus both `app/components/design-system` and `app/design-system`.
15. Public, hosted and dev-only routes are mixed together. shadcn uses route groups like `(app)`. We should split into `(site)`, `(hosted)` and dev-only routes.
16. Package scopes are mixed: `@repo/widgets`, `@repo/eslint-config` and `@repo/typescript-config` next to `@workspace/ui`.
17. `packages/ui` has no `lint`, `check-types` or eslint config, so turbo never checks it.
18. `apps/web` defines the `@/*` alias but uses it only twice. Everything else uses `../../../` imports.
19. The web app imports `../../../registry/registry.json` and `site.config.ts` by relative path. That dependency isn't declared in any package.json; `turbo.json` patches it by hand.
20. Adding a widget means hand-editing 6 places:
    - `packages/widgets/src/index.ts`
    - `apps/registry/scripts/registry-plan.ts`
    - `apps/registry/registry.json`
    - `apps/web/app/_lib/widget-catalog.ts` (2 slug unions)
    - landing `product-sections.tsx`
    - the playground
21. The `apps/web` `test` script is a hand-maintained, ~900-character list of files, enforced by `scripts/check-tests.ts`.
22. Some files are very large: `project-client.tsx` (2,334 lines) and `widgets-playground-client.tsx` (1,422 lines, still has an apiKey input).
23. Several files are tracked but generated or template leftovers:
    - `apps/registry/worker-configuration.d.ts` (11k lines, generated by wrangler)
    - `packages/typescript-config` `publishConfig`
    - `packages/widgets` tsconfig `outDir: dist`, with no build step
24. Convex files are camelCase (`httpActions.ts`). That's fine, because Convex module names map to API paths, but the exception should be documented, not renamed.

### E. Docs accuracy and per-package READMEs
25. `packages/widgets`, `packages/ui` and `packages/typescript-config` have no README. `packages/eslint-config/README.md` is titled `@turbo/eslint-config`.
26. Stale docs:
    - `docs/onboarding.md:74` points to tests in `core/`, but they're in `src/*.test.tsx`.
    - "First read" sends people to the hosted-only `convex/schema.ts`.
    - `docs/architecture/feedback-intake.md:10` names the wrong submitter file.
    - `docs/README.md` doesn't index `docs/research/*`, `DESIGN_SYSTEM.md` or `AGENTS.md`.
    - `CONTRIBUTING.md` has no "adding a widget" checklist and never mentions `DESIGN_SYSTEM.md`.
27. `docs/ops/runbook.md` mixes maintainer-only deploy/DNS work into contributor docs.

### F. Community and process
28. `.github/` contains only `workflows/ci.yml`. There are no issue forms, PR template, SECURITY.md, CODE_OF_CONDUCT, dependabot or FUNDING.
29. A `format` script exists, but there's no prettier config, no `format:check`, no `.editorconfig` and no `.vscode/`. Nothing checks formatting.

## Roadmap (one PR per phase, in this order)

**PR 1: Clean clone and one-command local dev** (findings 1–8)
- `bun run dev` runs the site only (no Convex). Add `dev:hosted`, which adds Convex and needs `HOSTED_ANALYTICS=local` in `apps/web/.env.local`.
- Change `resolveHostedMode` so hosted routes are reachable only when that flag is set *and* the keys exist. Production keeps `waitlist`/`off`. Update `hosted-config.test.ts`.
- `.env.example`:
  - Group variables into "site (none required)", "waitlist" and "hosted (local only)".
  - Add the missing variable.
  - Standardize on `bunx`.
- Add `.nvmrc` (20). Have CI read `bun-version-file: package.json`. Delete or fill `.npmrc`.
- Make `check-docs` walk `git ls-files` only.
- `.gitignore`:
  - Add `.design-system/`, `/*.pen`, `design/`, `.npm-cache/`, `public/r/` and empty-dir leftovers.
  - Drop the TestSprite lines.
  - Remove the empty dirs.
- Deduplicate the turbo env lists.

**PR 2: Structure for navigation** (findings 14–21, 23)
- Add route groups in `apps/web/app`:
  - `(site)/`: landing, components docs, design-system, privacy, llms.
  - `(hosted)/`: dashboard, sign-in/up, widgets playground.
  - Dev-only workbench routes, such as PR #27's `/states`.
  - URLs don't change.
- Move providers into `app/_components/providers/`. Merge the duplicate `design-system` folders. Delete the empty `app/lib/`.
- Rename packages to one scope, `@sentimeter/{widgets,ui,eslint-config,typescript-config}`. These are internal only; nothing is published.
- Give `packages/ui` `lint` and `check-types` scripts and an eslint config.
- Run a codemod that turns relative imports in `apps/web` into `@/…`.
- Make `apps/registry` a declared workspace dependency of `web` with an `exports` entry for `registry.json` and `site.config`. Drop the turbo input hacks.
- Derive the widget slug unions from one source (`registry-plan.ts`/catalog) to cut the hand-edit spots. Document the rest in CONTRIBUTING.
- Replace the hand-listed web `test` script with `scripts/test-web.ts`. It globs `*.test.ts(x)` and runs each isolated suite in its own process. Remove `check-tests` if it becomes redundant.
- Gitignore `worker-configuration.d.ts` and generate it in `check-types`. Remove the leftover `publishConfig`/`outDir`.
- *Deferred (not this PR):* splitting `project-client.tsx` and the playground. That's hosted code and can wait until hosted work resumes. Renaming the Cloudflare worker would change the live registry URL, so skip it.

**PR 3: Docs and agent files** (findings 9–13, 24–27), written against the final structure
- Rewrite `AGENTS.md` (shadcn-lean, accurate):
  - What the repo is.
  - A short folder map with one line per folder.
  - Commands.
  - Hosted-mode rules.
  - The generated-files policy.
  - The Convex naming exception.
  - Remove the personal rules.
- Add `CLAUDE.md` containing `@AGENTS.md`.
- Untrack all current `.agents/skills/*` and `skills-lock.json`. They stay on disk through `.git/info/exclude`. Keep `.agents/` documented as the home for future Sentimeter skills.
- Merge `DESIGN_PHILOSOPHY.md` into `DESIGN_SYSTEM.md`, dropping the API-key line. Trim `CONTEXT.md` so hosted terms sit under one "Hosted (local-only)" heading. Keep both at the root, because the skills expect `CONTEXT.md` there.
- Add READMEs to `packages/widgets`, `packages/ui` and `packages/typescript-config`. Fix the eslint-config README.
- Fix `onboarding.md`, `feedback-intake.md` and the `docs/README.md` index. Move maintainer deploy content into `docs/maintainers/`.
- Add an "Adding a widget" checklist to `CONTRIBUTING.md`, plus links to the design system and conventional commits (documented, not enforced).
- Untrack `docs/qa/` using `git rm --cached` plus exclude, so the local copy is kept. Old PR links still work because they point to commit SHAs.

**PR 4: Lightweight community and process** (findings 28–29)
- `.github/ISSUE_TEMPLATE/{bug_report,feature_request}.yml` plus `config.yml`.
- A `pull_request_template.md` with a 4-line checklist.
- `dependabot.yml`: monthly, minor and patch grouped.
- `SECURITY.md` using GitHub private vulnerability reporting. `CODE_OF_CONDUCT.md` using Contributor Covenant 2.1, with the reporting contact going through GitHub. No personal email unless the user provides one.
- A `.prettierrc` that matches the current style, `format:check` in CI, `.editorconfig`, and `.vscode/{settings,extensions}.json` with search excludes.
- Husky plus lint-staged running **prettier only on staged files**. It's fast and never blocks on type checks or tests. Skip commitlint and changesets for now; tag releases manually from `CHANGELOG.md`.
