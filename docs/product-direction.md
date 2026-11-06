# Product Direction

Status: agreed 2026-11-07. This records where Sentimeter is going and the order
of work. Update it when a step lands or a decision changes.

## Problem

Small teams ship SaaS quickly, so things break. When a user hits a broken or
confusing moment, giving feedback should be obvious and take seconds, and the
user should feel heard. Ratings measure sentiment; this job is recovering a
frustrated user.

## Who it is for

Solo founders and small teams building React apps with shadcn, usually shipping
fast, often with AI coding tools.

## Positioning

Free, open-code feedback components that look native in a shadcn app and save
through the host's own backend. The free registry is the distribution. A paid,
hosted inbox that lets the team reply ("we fixed it, thanks for telling us") is
the business, and it is validated with a waitlist before it is built.

Comparable paid products earn from what happens after submission: captured
context, triage, integrations, and closing the loop with the user. The widget
itself is the free front door.

## Order of work

1. **UI consistency (now).** One shell, one directory, one preview frame, one
   component page template, one install story. Spec below.
2. **Components organized by moment.** Purpose-built components with few props,
   sharing the existing state machine and `submit` contract: an always-visible
   feedback button, a "Report a problem" dialog with captured context, an error
   page that asks what happened, and a failure toast action. Emoji, thumbs, and
   stars remain as the "after something went well" group. The report payload
   should borrow the open category, severity, and evidence fields of the
   [agent feedback protocol](https://feedback.now/) so any backend can accept it.
   This step changes the public widget API on purpose and updates
   [CONTEXT.md](../CONTEXT.md).
3. **Waitlist for the hosted inbox.** Reposition the unreleased hosted work from
   sentiment analytics to an inbox with replies. Build only after demand shows.

## Step 1 spec: UI consistency

Scope is the public site and docs. Widget behavior and props do not change in
this step.

Step 1 ships in two halves. The first half holds regardless of what step 2
decides about components: one public noun, one shell, one preview frame, one
copy source, the component page outline, and the install story. The second half
depends on step 2 and waits for it: homepage content and order, directory
grouping, the card meta line, and the preview's layout and glyph controls.

### Decisions

- **One public noun.** Public copy says "components" (matching `/components`
  and shadcn). Not "widgets", "collection", or "feedback widgets". Code and
  [CONTEXT.md](../CONTEXT.md) keep the term Widget.
- **One shell.** Every public page uses the same header: logo, Components, Docs,
  search, GitHub, theme toggle. Design system and hosted analytics move to the
  footer.
- **The homepage is the directory.** Order: short hero (headline, one sentence,
  install command, two buttons), the component grid, a three-step "how it works"
  (add, place, connect `submit`), FAQ, footer. The scenario showcase and design
  system sections are removed from the homepage.
- **One preview frame.** A single component renders every live example on the
  homepage, directory cards, and component pages: same surface, padding,
  minimum height, centered example, and a Reset control in the same corner with
  the same label. "Runs locally. Nothing is sent." appears once per page.
- **One copy source.** Each component has one default title, description,
  layout, and glyph set in `apps/web/lib/widget-catalog.ts`. Every preview and
  every code snippet uses it, so the code shown produces exactly the example
  shown.
- **One directory card.** Preview frame, then name, one-line description, and a
  short meta line (for example "Stacked · Inline"). The whole card links to the
  component page. Cards share one height.
- **One component page template.** In order: name, description, Copy as
  Markdown; Preview and Code tabs, with visible layout and glyph controls instead
  of a collapsed accordion; Installation; Usage; Props; previous and next links.
  Submission behavior is written once in Docs and linked, not repeated per page.
- **One install story.**
  - Every page uses the same command format.
  - The chosen package manager persists across pages.
  - The file summary names what is added (`components/sentimeter/<name>.tsx`
    plus the shared `feedback-system/` folder) instead of leading with a file
    count.
- **Docs is one page.** Install, use, connect your backend, accessibility,
  agents. Its sidebar label and header link both say Docs.

### Drift this removes

- Like / Dislike renders as an inline pill on the homepage and a stacked card in
  the directory.
- One component carries several titles ("Rate your experience", "How was your
  support experience?", "How was getting started?").
- Reset is labeled "Reset" in one place and "Reset example" in another.
- Live examples use four different frames (hero panel, showcase inset, directory
  card, component page).
- The homepage header and docs header differ in links, labels, and search.
- One thing has six names: Widgets, Feedback Widgets, components, collection,
  "Find your widget", "Browse widgets".

### Done when

- Every public route uses the same header and footer.
- Every live example renders through the shared preview frame.
- Each component shows the same default example on the homepage, in the
  directory, and on its page, and its Code tab reproduces it.
- Public copy uses one noun throughout.
- Light and dark screenshots at 1440px and 390px of `/`, `/components`, each
  component page, and Docs show the same frame, card, and spacing.
- `bun run lint`, `bun run check-types`, `bun run test`, `bun run check-design`,
  and `bun run check-docs` pass.

### Out of scope for step 1

- Widget props and defaults. Every example passing `autoHide={false}` suggests
  the default is wrong; revisit it in step 2.
- New components, hosted inbox work, and new visual directions.
