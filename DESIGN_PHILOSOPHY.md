# Sentimeter Design Philosophy

Sentimeter should feel like a quiet developer tool: precise, shadcn-native, and
easy to scan. The product is selling trust in an install flow, so visual choices
should reduce doubt rather than decorate the page.

## Principles

### Shadcn First

- Use existing shadcn/ui primitives from `packages/ui`.
- Install missing shadcn components instead of creating custom UI primitives.
- Do not create custom SVG icons. Use `lucide-react` when an icon is needed.
- Keep widget examples close to how they will look after installation in a host
  shadcn app.

### Calm Operational UI

- Prefer dense, structured dashboard views over marketing-heavy cards.
- Use semantic tokens such as `bg-background`, `bg-card`, `text-foreground`,
  `text-muted-foreground`, `border-border`, and `bg-muted`.
- Use restrained accent color for meaning: success, warning, destructive,
  selection, or primary action.
- Avoid decorative gradients, oversized hero treatment inside app surfaces, and
  palette choices that make the UI feel like a single-color theme.

### Native Install Confidence

- The first viewport should make the actual widget and install command obvious.
- Registry documentation should show exact `shadcn add` commands and what files
  the command installs.
- Dashboard install guidance should distinguish publishable API keys, allowed
  origins, and endpoint overrides.

### Feedback Is Lightweight

- Widgets should feel fast and small. Do not add heavy animations, layout shifts,
  or multi-step flows unless the user explicitly asks for more detail.
- State changes should be readable: idle, selected, submitting, done, and error
  recovery.
- Text input is optional context, not a wall between the user and the reaction.

### Accessibility And Responsiveness

- Interactive controls need keyboard focus, disabled states, and useful labels.
- Text must fit on mobile and desktop without overlapping.
- Prefer stable dimensions for ratings, controls, charts, and dashboard panels
  so realtime updates do not shift the layout.
