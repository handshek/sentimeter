# @workspace/ui

Shared shadcn/ui primitives and theme foundations for the Sentimeter site and
widget previews. Installed widgets do not depend on this package; they use the
host app's own shadcn components.

```text
src/
  components/        Vendored shadcn primitives (add more with the shadcn CLI)
  lib/utils.ts       cn() helper
  styles/
    globals.css      Semantic colors, light/dark themes, radius, Tailwind setup
    foundations.css  Shared ds-* type, spacing, surface, and motion roles
```

Add a primitive from `apps/web` with `bunx shadcn@latest add <component>`; the
monorepo `components.json` files place it here. Keep vendored files identical
to upstream so they can be updated cleanly. Color and type rules live in
[DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md).
