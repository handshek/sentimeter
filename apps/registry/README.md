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
│   ├── core/
│   │   ├── submit.ts
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

The first install pulls in the shared `feedback-system` tree. Installing another
Sentimeter Widget adds its preset file while reusing that shared tree.

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
