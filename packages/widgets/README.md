# @workspace/widgets

The canonical source for Sentimeter's feedback widgets. It is the only place
widget behavior is written. The site imports it directly, and
`apps/registry` emits it as installable shadcn registry items. Nothing here is
published to npm.

## Layout

```text
src/
  emoji-feedback.tsx      Widget wrappers, one per registry item
  like-dislike.tsx
  star-rating.tsx
  feedback-system.ts      Shared entry: types, parts, and helpers
  design-system.ts        Widget recipes and FeedbackStyle tokens
  types.ts                Public types (payload, submit, glyphs)
  compound/               Composable parts (FeedbackWidget, FeedbackRating, ...)
  core/                   State machine and WidgetSubmitError
  *.test.tsx              Behavior tests (Happy DOM + Testing Library)
```

## Rules

- Import shadcn primitives from `@workspace/ui` and utilities from
  `@workspace/ui/lib/utils`. The registry adapter rewrites these to the host's
  `@/components/ui/*` and `@/lib/utils`; any other workspace import fails the
  registry check.
- Keep widgets usable in a 288px container with 44×44px reaction targets,
  keyboard-accessible, and theme-aware.
- Widget design rules are documented in
  [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md#widget-library-contract).

## Commands

```sh
bun run --cwd packages/widgets test
bun run check-registry   # from the repository root, after any change here
```
