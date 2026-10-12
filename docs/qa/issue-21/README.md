# Dismissal callback evidence

Issue [21](https://github.com/handshek/sentimeter/issues/21): host `onCancel` failures escaped the widget observer error contract. Dismissal completed, but an async rejection reached the global unhandled-rejection handler. Synchronous throws were also unreported by the existing isolation mechanism.

## Repeat and verify

From `packages/widgets`, run `bun test src/feedback-widget.test.tsx -t 'dismissal callback'`. Both new rendered regressions fail on the baseline and pass with this fix. They cover a throwing synchronous callback and a deferred async rejection, immediate dismissal, focus restoration and exact observer error reporting. The full widget suite passes46 tests. The same existing test file also covers normal dismissal and moved-focus behavior.

An independent custom callback probe listens for `unhandledRejection` and captures the existing console error reporter. It clicks the actual rendered dismiss button, waits20ms, checks the hidden-state anchor and focus, and reports:

Before: `{"hidden":"Feedback widget closed","focusRestored":true,"unhandled":["Dismiss analytics rejected"],"reported":[]}`.

After: `{"hidden":"Feedback widget closed","focusRestored":true,"unhandled":[],"reported":[["Sentimeter widget callback threw:","Error: Dismiss analytics rejected"]]}`.

The coordinator independently repeated the passing probe. See [reproduction before](reproduction-before.log), [after](reproduction-after.log) and regression [before](regression-before.log)/[after](regression-after.log). These are happy-dom/custom host callback fixtures. There is no visible UI change, so before/after log evidence is used. No hosted analytics service or live backend is verified or mutated.

## Validation and review

Lint, types, full repository tests, build, registry reconstruction, docs and test inclusion pass. The reconstructed registry host type-checks the same internal import; no registry footprint or public package API changes are needed. The fix shares the existing internal notification helper and applies it after `hide()`.

[Fresh native review](review.md) found no actionable issues. Claude/T3 was skipped at the user's request. [Baseline](baseline.json) records the clean isolated checkout. The identical `apps/web/vercel.json` safeguard suppresses `codex/*` automatic deployments. This PR independently targets master.
