# Assessment of arla6ka/skills for Sentimeter UI consistency

Research date: 2026-10-03. Source snapshot: commit
[`d7a198df8281a6b196360028fe818d155bf751c0`](https://github.com/arla6ka/skills/commit/d7a198df8281a6b196360028fe818d155bf751c0),
committed 2026-09-30 at 03:53:01 UTC. This is a source assessment, not a measured
before/after trial. No skills were installed, upstream scripts executed, or
application UI changed. A pinned public source archive was read in temporary
storage.

## Verdict

**There is a credible opportunity for significant improvement, provided the
workflow is adapted to Sentimeter.** The strongest contribution is a repeatable
process for finding inconsistent choices, agreeing on canonical ones, migrating
screens with evidence, and catching new drift. Installation alone does not
change the UI. It is an agent workflow with supporting checks, not a ready-made
theme or component kit. The README advertises whole-app consistency; the actual
default writing workflow establishes the system and migrates a pilot, then offers
the remaining migration separately. [README](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/README.md),
[build modes](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/references/modes.md).

Sentimeter already has shared shadcn primitives and semantic CSS tokens. The
relevant approach is to strengthen their adoption and rules, then reconcile each
surface with those decisions. This does not require starting a second component
library. That fits the repository's explicit shadcn foundation: existing stock
primitives remain canonical, existing token names stay intact, semantic variable
pairs live in the existing CSS file, and a workspace `packages/ui` is a supported
distribution option. [shadcn-specific workflow](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/references/base-shadcn.md).

## What the six skills actually contribute

| Skill                                                                                                                                          | Observed capability                                                                                                                           | Use for Sentimeter                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [design-system-boss](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/design-system-boss/SKILL.md)       | Triages the app, chooses build/harden/adopt/audit/review routes, coordinates siblings, and tracks evidence in a state file.                   | A whole-site consistency coordinator, after scope and constraints are configured.                            |
| [build-design-system](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/SKILL.md)     | Inventories existing UI, establishes tokens and canonical component families, adds checks and docs, and proves a pilot flow.                  | Strengthen the current shared system and its adoption rules.                                                 |
| [migrate-design-system](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/migrate-design-system/SKILL.md) | Starts in audit mode unless migration is requested; maps legacy usage and gaps, then migrates and verifies surfaces against pinned baselines. | Audit website, docs and widget examples; migrate incrementally once their contracts are clear.               |
| [token-mapping](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/token-mapping/SKILL.md)                 | Read-only mapping of raw and palette values to existing tokens by purpose before numeric similarity; flags ambiguity and missing roles.       | Find places bypassing existing colors, radii and spacing conventions.                                        |
| [component-docs](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/component-docs/SKILL.md)               | Drafts component API/state/usage documentation from code and real uses, with conflicts and guesses marked.                                    | Document application-specific usage and supported widget states. It does not restyle the current docs shell. |
| [ui-review](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/ui-review/SKILL.md)                         | Reviews rendered flows against named criteria, with viewport/state coverage and measured interaction evidence.                                | Find layout, state and interaction inconsistency that source lint misses.                                    |

## Incremental value beyond general design guidance

The repository contains executable enforcement machinery rather than only
instructions to use tokens. Its dependency-free Node starter checks raw/palette
values, native controls where a shared primitive exists, static padding/radius/
shadow/background overrides on registered components, deprecated imports and
unreviewed changes to tracked primitive files. It includes an existing-violation
allowlist, counts that can only decrease, changed-line warnings and fixtures for
bad/good examples. [check-system.mjs implementation](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/scripts/check-system.mjs).

That is the meaningful extra value over a skill that already explains Tailwind
tokens, CVA variants and dark mode: it can make agreed rules fail a check and
keep legacy debt from growing. The workflow requires the agent to demonstrate a
check failing on a planted violation and passing again, wire the real CI command,
and report what the check cannot see. Its warning-only changed-line mode does
not itself block merges; the full check and ratchet must be configured and run.
[enforcement workflow](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/references/checks.md).

Migration guidance also goes beyond a bulk class replacement. It distinguishes
exact visual parity from intentionally mapped differences, captures multiple
widths/themes/states, tests no-change screenshot noise, hashes baselines, forbids
workers from altering test thresholds, and rechecks the final integration commit.
Existing behavior tests remain useful inputs to this process; a rendered review
adds evidence they cannot supply. [migration verification](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/migrate-design-system/references/verification.md).

For docs with embedded examples, a dedicated script compares an example's
computed styles alone and inside its docs page. This could expose docs chrome
changing widget appearance. It needs prepared URL pairs and matching markup; it
is not a general docs-theme harmonizer. Without a browser it defaults to SKIP
with exit 0, so `--strict` is necessary if this check becomes required.
[check-docs-leak.mjs](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/scripts/check-docs-leak.mjs).

## Concrete fit with the current Sentimeter code

The following are source observations, not severity ratings from a rendered
audit. The current browser UI, authenticated dashboard, computed CSS and all
interaction states were not inspected in this assessment.

| Area                         | Evidence in Sentimeter                                                                                                                                                                                                                                                                                                                           | What the proposed workflow could improve                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared foundation            | [Global CSS](../../packages/ui/src/styles/globals.css) already defines semantic colors, light/dark values and a radius scale. [Design philosophy](../../DESIGN_PHILOSOPHY.md) already requires shared shadcn primitives and semantic tokens.                                                                                                     | Turn these principles into concrete usage rules and checked exceptions, extending the existing foundation.                                                                                                                                                                                                                                         |
| Docs colors                  | [docs.css](../../apps/web/app/components/docs.css) imports Fumadocs' neutral theme and maps only background, foreground, muted foreground and border. Other Fumadocs roles retain their separate values.                                                                                                                                         | Audit the whole theme bridge. Fumadocs already provides a shadcn preset for adopting the main app's theme colors; this capability also exists in the installed 16.10.5 package, so a replacement docs framework is unnecessary. [Official Fumadocs theming](https://fumadocs.dev/docs/ui/theme), [installed version](../../apps/web/package.json). |
| Widget button shape          | The shared [Button](../../packages/ui/src/components/button.tsx) uses `rounded-md`, while [FeedbackFooter](../../packages/widgets/src/compound/feedback-footer.tsx) overrides its buttons with `rounded-2xl`, font weight and padding. The global custom radius scale maps sm/md/lg/xl, leaving 2xl outside that particular base-radius mapping. | Decide which visual differences are intended and represent them through approved existing variants or rules. A configured checker can flag static visual overrides; computed-style and host-theme checks still need to establish the actual effect.                                                                                                |
| Input adoption               | [ProjectsClient](../../apps/web/app/dashboard/_components/projects-client.tsx) styles a native project-name input directly even though a shared [Input](../../packages/ui/src/components/input.tsx) exists, with different border, background, padding and state styling.                                                                        | Consolidate ordinary form-control usage and verify invalid, focus, disabled and loading states. Specialized [rating controls](../../packages/widgets/src/compound/feedback-rating.tsx) need their own reviewed semantics and exceptions.                                                                                                           |
| Status colors                | [ProjectClient](../../apps/web/app/dashboard/_components/project-client.tsx) defines emerald/rose/amber/zinc classes for sentiment and chips; the shared theme has no success or warning role. The tester also uses palette colors.                                                                                                              | Establish semantic status/sentiment roles where justified, rather than mapping every hue to the primary accent. The palette check is directly relevant.                                                                                                                                                                                            |
| Brand and layout conventions | The [landing header](../../apps/web/app/_components/landing/header-section.tsx) uses title-case `Sentimeter`, `text-lg` and `max-w-6xl`; the [dashboard](../../apps/web/app/dashboard/layout.tsx) uses uppercase `SENTIMETER`, `text-sm`, tracking and `max-w-5xl`; docs set a separate layout width.                                            | Review brand presentation and define intentional layout/type variants for marketing, docs and operational screens. Different widths are not automatically defects.                                                                                                                                                                                 |

Sentimeter already has a [Tailwind design-system skill](../../.agents/skills/tailwind-design-system/SKILL.md)
covering tokens, CVA, responsive design and dark mode, and
[widget behavior tests](../../packages/widgets/src/feedback-widget.test.tsx) plus
[dashboard accessibility tests](../../apps/web/app/dashboard/_components/project-accessibility.test.ts).
The reviewed [lint configuration](../../packages/eslint-config/next.js),
[project commands](../../package.json) and [docs check](../../scripts/check-docs.ts)
do not express a shared visual usage policy or enforce these particular
consistency decisions. The additional value is inventory, adoption, rendered
verification and prevention of recurring drift, rather than another explanation
of how Tailwind tokens work.

For portability, [CONTEXT.md](../../CONTEXT.md) establishes
`packages/widgets` as canonical source and Registry Items as generated
installable source using host-local conventions. Changes must enter through
that source and preserve the installed host app's semantic colors and component
behavior. [Official shadcn theming](https://ui.shadcn.com/docs/theming) confirms
that semantic CSS variables are the mechanism for theme-wide color and radius
control.

## Limits and prerequisites

- **The monorepo needs explicit configuration.** The starter's default scan
  includes `app`, `src`, `components`, `lib` and `pages`, and looks for UI folders
  such as `components/ui`. At Sentimeter's root, `apps/web` and `packages/ui/src`
  need explicit `include`, `uiDir`, `tokenSources`, registry and export settings.
  The widget distribution registry is not an inventory of shared `Button`,
  `Card` and `Input` primitives; the override check needs those names/exports
  configured separately or an appropriate extension.
  Otherwise apparent cleanliness can mean omitted files.
  [scanner defaults and configuration](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/scripts/check-system.mjs#L219).
- **Static checks cannot certify visual consistency.** The scanner uses text
  matching and a lightweight JSX parser. It explicitly misses runtime-built
  classes/overrides, unlisted components, rendered contrast, layout, focus and
  keyboard behavior. Static radius overrides are detectable once the component
  is registered; all uses of a semantic color can still pass while serving
  inconsistent roles. [documented blind spots](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/scripts/check-system.mjs#L197).
- **It does not choose a better visual direction automatically.** The default
  preserves the current look; a new design direction requires an explicit
  reference and sample confirmation. Review criteria and token tolerances are
  starting assumptions to adapt, including a default 2px tolerance for radius
  and spacing. [design-source rules](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/references/modes.md),
  [mapping rules](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/token-mapping/references/mapping-rules.md).
- **Runtime evidence has a setup cost.** The writing workflows need shell,
  Git and Node; triage uses `rg`. Captures need a running app, browser tooling,
  stable data and state-driving functions. Authenticated routes need safe
  fixtures or provided test storage state. Playwright/Chromium are the primary
  capture path, with an agent-browser fallback, and a full accessibility scan
  uses axe-core. [browser workflow](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/references/browser.md),
  [browser resolver](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/scripts/find-chromium.mjs).
- **Quality evidence is limited.** There are extensive pass/fail source
  fixtures and manual evaluation recipes, but the inspected testing document
  presents a method and empty comparison template, not published measured
  effectiveness on Sentimeter or a benchmark demonstrating the promised gains.
  Scripts and the full agent workflow were not run for this assessment.
  [testing guidance](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/TESTING.md),
  [workflow test cases](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/TESTS.md).

## Required adaptations for Sentimeter

1. **Keep shadcn canonical.** The upstream shadcn reference allows a progression
   ending in a custom wrapper. Sentimeter's instruction prohibiting custom UI
   components and SVG icons takes precedence; any missing primitive must follow
   the approved shadcn installation process. Rewrite the operational examples
   from `npm`/`npx` to `bun`/`bunx`. Use Context7 for any library/API implementation
   or configuration work. [shadcn reference](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/references/base-shadcn.md).
2. **Preserve widget portability.** The hosted website can share Sentimeter's
   visual tokens, while installed widgets must inherit the host app's shadcn
   theme and component structure. Canonical widget source, generated registry
   output, installed examples and host theme compatibility need their own
   migration boundaries. Do not interpret whole-app consistency as permission
   to impose the dashboard's branding on consumers. Upstream supports registry
   distribution but does not establish this Sentimeter-specific contract.
   Specialized rating controls also need reviewed exceptions to a blanket
   native-control rule where their semantics require one.
   [registry/workspace guidance](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/references/base-shadcn.md#distribution).
3. **Adapt docs to the current site.** The default generates `docs/system`,
   `public/system`, `llms.txt`, an AGENTS index and, on a full footprint, project
   skills. Reuse the existing docs setup and select only needed artifacts;
   creating a parallel documentation site would add another consistency burden.
   [generated system structure](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/build-design-system/references/system-structure.md).
4. **Override operational defaults.** Do not start `bun run dev` or restart the
   existing server under this research request. Any required interactive CLI,
   login or manual browser authorization must be user-run. Default branch names
   use `ds/`; this workspace's convention uses `codex/`. External instructions
   explicitly defer to user/project rules, but those constraints still need to
   be placed in each working brief. [project-rule precedence](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/design-system-boss/SKILL.md),
   [migration frame](https://github.com/arla6ka/skills/blob/d7a198df8281a6b196360028fe818d155bf751c0/skills/migrate-design-system/SKILL.md).

## Recommendation

Use the repository as a source for a constrained audit-and-enforcement workflow.
Begin with an inventory of the actual website, docs and widgets, settle shared
tokens/component usage plus intentional surface differences, then prove one
representative flow and a small set of drift checks. Follow with the remaining
migration only after those rules and widget compatibility are verified. This
could materially improve consistency and prevent recurrence; wholesale skill
installation is unnecessary to reach that outcome and is not recommended by
this assessment.

A useful first implementation would prove a docs-to-widget flow, including
selection, submitting, success and error states, at narrow and wide widths in
both themes. It should verify docs theme mapping, reuse of existing primitives,
and the installed widget under contrasting host themes. Configure drift checks
for the actual monorepo paths and shared component exports, demonstrate failing
and passing examples, and record reviewed legacy exceptions. Then expand to
dashboard and remaining public/auth surfaces. Success should be judged by those
observable results; a completed skill installation is not an outcome measure.
