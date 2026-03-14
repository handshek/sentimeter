# Sentimeter Registry

Cloudflare Worker that serves the built shadcn registry for Sentimeter widgets.

## Local commands

```bash
bun run registry:build
bun run dev
```

```bash
bun run cf-typegen
```

```bash
bun run deploy
```

## Install shape

Installing a widget should produce:

- `components/sentimeter/feedback-system.tsx`
- `components/sentimeter/<widget>.tsx`

Example:

```bash
bunx shadcn add @sentimeter/emoji-feedback
```

That first install pulls in the shared `feedback-system.tsx`. Installing another Sentimeter widget should add only one extra widget file.
