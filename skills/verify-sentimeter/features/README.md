# Sentimeter verification map

This directory is the maintained source for verifying what Sentimeter users
see and install. Read this index before driving the app, then follow the
matching feature file. Every name below was read from a live accessibility
snapshot. When the UI changes, update the file rather than working around it.

## Baseline preconditions

- Run `$SV launch` (add `--registry` for registry work), where `SV` is
  `skills/verify-sentimeter/scripts/sv.ts`, run from the repository root.
- `$SV doctor` passes: this run owns the site, hosted mode is off, the build
  matches the tree, and nothing has left `127.0.0.1`.
- The site is at `http://127.0.0.1:3107`, and the registry, if launched, at
  `http://127.0.0.1:8797`.
- Never drive an instance this run did not start, including the user's
  `bun run dev` on :3000.

## Driving conventions

- Start each recipe with `$SV open <path>`. Navigation resets widget state.
- Locate controls by role and accessible name, scoped with
  `--within-role group --within-name "<Widget> local demo"` when a name
  repeats on the page.
- Treat the commands as literal, with quoted names unchanged.
- Read state from `$SV snapshot`: `[pressed]`, `[disabled]`, `[focused]`,
  `[checked]`, `[selected]`, `value="…"`, and `status` text.

## Proof and skip reporting

- Save a before and an after snapshot around the step that matters, plus one
  screenshot of the end state, as `<feature>/<NN>-<state>.(aria.txt|png)`.
- End every browser recipe with `$SV net-check`. Local demos must not touch
  the network.
- Registry proof records the status line, the relevant headers, and the body
  fields.
- Record which entry point you used. If an entry point can't be reached, report
  it with the command you tried and the precondition that failed. Do not
  count it as verified through a different path.

## Feature entry contract

Each feature file has an H1 title and a one-paragraph summary, followed by
exactly four H2 sections: `Sub-features`, `How to get to it (user POV)`,
`Driving it with sv`, and `Gotchas`. Keep implementation details out; name
user paths, stable handles, required state, commands, and observable proof.

## Features

- [Widget demos](./widget-demos.md): the live emoji, thumbs and star demos on
  each docs page. Select, comment, submit, cancel, reset, and keyboard use.
- [Customize preview](./customize-preview.md): layout, variant and size
  selects, the text-input switch, Restore Defaults, and the Code tab.
- [Install command](./install-command.md): package-manager tabs, Copy Command,
  file paths, and the Markdown copies for agents.
- [Landing page](./landing-page.md): hero and product examples, navigation, and
  the theme toggle.
- [Registry](./registry.md): the Worker serving `/r/<name>.json`, which
  `shadcn add` installs.

Not mapped yet: `/design-system` chapters, `/components/getting-started`,
docs search (`Search ⌘ K`), and `/privacy`. The hosted dashboard and waitlist
are deliberately out of scope. They must stay closed during verification.
