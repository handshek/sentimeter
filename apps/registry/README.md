# Sentimeter Registry

Cloudflare Worker that serves the built shadcn Registry Items for Sentimeter
Widgets. Widget behavior is authored only in `packages/widgets/src`; this app
adapts that source into host-local open code.

## Local commands

```bash
bun run registry:emit
bun run registry:build
bun run registry:check
bun run dev:registry
bun run cf-typegen
bun run deploy
```

The same registry commands are delegated from the repository root as
`registry:emit`, `registry:build`, and `check-registry`.

## Generated staging

Registry Item source is private build output under:

```text
apps/registry/.generated/sentimeter/
├── feedback-system/
│   ├── index.ts
│   ├── types.ts
│   ├── design-system.ts
│   ├── core/
│   │   ├── errors.ts
│   │   └── use-widget-machine.ts
│   └── compound/
├── emoji-feedback.tsx
├── like-dislike.tsx
└── star-rating.tsx
```

The staging directory is ignored and must not be edited. `registry:emit`
recreates it deterministically from `packages/widgets/src`. `registry:check`
refreshes ignored staging, builds JSON in a temporary directory, validates
manifest/content parity, and type-checks a temporary host. It leaves tracked
files and `public/r` untouched.

## Install shape

Installing a Widget produces the corresponding modular tree in the host:

```text
components/sentimeter/
├── feedback-system/
│   ├── index.ts
│   ├── types.ts
│   ├── design-system.ts
│   ├── core/
│   └── compound/
└── <widget>.tsx
```

Registry Items contain host-local imports such as `@/components/ui/button`.
Preset imports such as `./feedback-system` intentionally remain
directory-resolved through `feedback-system/index.ts`.

Example:

```bash
bunx shadcn add "https://registry.handshek.workers.dev/r/emoji-feedback.json"
```

This example uses `REGISTRY_URL` from [site.config.ts](site.config.ts).
`SITE_URL` and `REPOSITORY_URL` live in the same file so the public catalog and
registry generation share one host configuration. Follow the
[domain switch runbook](../../docs/ops/runbook.md) before changing these hosts.

The first install pulls in the shared `feedback-system` tree. Installing another
Sentimeter Widget adds its wrapper file while reusing those 14 shared files. The
design-system module travels with every install and reads the host's shadcn
theme. Host-local Button, Textarea, and Label components
and Lucide remain the only UI dependencies; no Sentimeter stylesheet or font
download is required.

Widgets complete locally unless the host supplies a custom `submit` handler.
The handler receives the rating, optional comment, widget type, and location.
The registry includes no hosted endpoint or project-key integration.

## Build flow

From the repository root:

```bash
bun run registry:emit
bun run check-registry
bun run registry:build
```

`registry:build` refreshes staging, runs a non-interactive shadcn build and host
type check, then atomically replaces ignored public JSON under
`apps/registry/public/r/`. The registry runtime also participates in the root
`build`, `lint`, `check-types`, and `test` Turbo tasks through its standard
package scripts.
