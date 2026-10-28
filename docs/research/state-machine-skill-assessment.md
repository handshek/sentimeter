# State-machine skill assessment

> **Update, 2026-10-28:** the repository no longer tracks third-party agent
> skills (see the [structure audit](repo-structure-audit.md)). Install this skill
> locally with the `skills` CLI if you want the workbench.

Assessed 13 October 2026 for Sentimeter. Adopt the single, explicitly invoked
`state-machine` skill from Jakub Krehel's collection. It provides a temporary
workbench for inspecting an existing component's states; it does not introduce
a state-machine library or automatically review or redesign UI.

## Source and installation

The [linked post](https://x.com/jakubkrehel/status/2109306232859398295) demonstrates
`/state-machine` and quotes the author's announcement linking to
[jakubkrehel/skills](https://github.com/jakubkrehel/skills). Direct X retrieval was
blocked; the post and quoted announcement were read through a public mirror.
The actual skill was inspected in the upstream Git repository.

- Upstream commit: `4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63`.
- Source: [skills/state-machine](https://github.com/jakubkrehel/skills/tree/4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63/skills/state-machine).
- Upstream files: [SKILL.md](https://github.com/jakubkrehel/skills/blob/4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63/skills/state-machine/SKILL.md),
  [switcher.md](https://github.com/jakubkrehel/skills/blob/4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63/skills/state-machine/switcher.md) and
  [Codex invocation policy](https://github.com/jakubkrehel/skills/blob/4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63/skills/state-machine/agents/openai.yaml).
- License: [MIT, copyright 2026 Jakub Krehel](#upstream-license-notice).
- Installed with Vercel's official `skills` CLI 1.7.1; `skills-lock.json`
  records the source, exact revision, path and content hash. Upstream files are
  unchanged, including `disable-model-invocation: true` and
  `allow_implicit_invocation: false`.

The shared global library was checked with `skills list -g`; no `state-machine`
installation was found. This project copy follows the existing committed
`.agents/skills` convention so it travels with the PR. Other personal skills
remain in the shared global library. No other skill in the upstream collection
was installed.

To reinstall the reviewed version from the repository root without prompts:

```sh
skills add https://github.com/jakubkrehel/skills/tree/4c66b1fa86e9ab70187b43d7da9b6fdb29f2ef63/skills/state-machine --skill state-machine -a codex -y
```

For an update, inspect the new upstream revision first, then use its commit in
that command. Review the generated lockfile and refresh the embedded upstream notice if
needed. Keep project adaptations in `AGENTS.md` and this document instead of
patching the vendored files or changing their invocation defaults.

## Why it is useful here

The useful addition is a URL-addressable workbench that keeps transient states
visible while the developer works on the real component. Existing skills cover
tokens, accessibility, React performance and general prototyping; this workflow
imports the production component and feeds its actual data boundary.

Sentimeter already has substantial preview coverage:

| Existing surface                                                                                                                                                                           | Additional value from this workflow                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [Public widget demo](../../apps/web/components/docs/widget-demo.tsx) exposes configuration and manual interaction.                                                                         | Name reachable states and link to a scenario through `__state`.                      |
| [Submission specimen](../../apps/web/app/%28site%29/design-system/_components/widget-specimens.tsx) demonstrates pending, failure, retry and success; pending lasts 1.1 seconds.           | Hold pending indefinitely and keep confirmation visible for inspection.              |
| [Hosted tester](../../apps/web/app/%28hosted%29/widgets/_components/widgets-playground-client.tsx) has mock success/error, finite delay and disabled controls, alongside real submissions. | Build a focused local workbench without hosted credentials or real submission paths. |

This is an assessment of the workflow's fit, not evidence of a measured quality
improvement. No workbench or application UI is created by installing the skill.

## Using it safely within the project

Invoke it for one component, for example: “Use the state-machine skill for
StarRating, with local submissions, and follow AGENTS.md.” The upstream workflow
first inventories reachable states and their data sources. It imports the real
component, verifies every state in the browser, then leaves the temporary page
available for further visual work.

Read the project-specific overrides in [AGENTS.md](../../AGENTS.md) before the
upstream switcher reference. That reference deliberately uses its own colors,
fonts, native controls and inline SVGs; Sentimeter uses installed shadcn controls,
Lucide and shared semantic roles instead. Preserve grouping, direct state links,
responsive controls and accessible labels. Keep keyboard shortcuts within the
workbench controls rather than binding them across the component under test.

The widget [machine](../../packages/widgets/src/core/use-widget-machine.ts)
starts at `idle` and owns its state internally. Public states are `idle`,
`selected`, `submitting` and `done`; failure is `selected` with an error, while
`disabled` and dismissal are separate conditions. Do not invent a `state` or
`initialState` prop. Use real interactions and the existing `submit`, `disabled`
and `autoHide` seams. A pending mock promise can hold submission, rejected and
resolved promises exercise failure and success, and `autoHide={false}` keeps
confirmation visible. A scenario URL alone cannot initialize internal state:
drive the real interactions or report that a separately approved seam is needed.

Dashboard components subscribe directly to Convex. Test-runner module mocks are
not browser providers, so do not promise fixture isolation without verifying a
real browser seam. Never silently fall through to live requests or mutations.
Keep route, mocks and controls in one disposable folder, available only during
development, and exclude them from commits and deployments. Remove that setup
only when asked, preserving any intended production edits made during the work.

Continue to follow `AGENTS.md`: use Context7 for library/API implementation,
`bun`/`bunx` for dependencies, leave the running dev server alone, and let the
user run any interactive login or authorization step. For subsequent UI changes,
run the existing design and interaction checks, registry validation when widgets
change, and browser checks across themes, widths, keyboard and changed states.
The workbench complements those checks; it does not replace them.

## Upstream license notice

This notice applies to the vendored `state-machine` skill files. The upstream
MIT terms require the copyright and permission notice to accompany copies.

<details>
<summary>MIT license — Jakub Krehel</summary>

```text
MIT License

Copyright (c) 2026 Jakub Krehel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

</details>
