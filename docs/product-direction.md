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

1. **UI consistency (first half landed 2026-11-07).** One shell, one
   directory, one preview frame, one component page template, one install
   story. Spec below; its second half is now defined by the launch spec.
2. **Launch set.** Modify the three ratings, add new components and placement
   blocks, and redesign the homepage around situations. Everything launches
   together on X. Spec below.
3. **Waitlist for the hosted inbox.** Reposition the unreleased hosted work from
   sentiment analytics to an inbox with replies. At launch it is one quiet
   homepage section; build only after demand shows.

## Launch spec

Decided 2026-11-07. The "moments" proposed earlier turned out to be one of
three shapes placed in different spots, so the launch has few components and
one block per spot.

### Components

The public API may break freely before launch; launch is the first stable API.

- **Emoji, Thumbs, Stars.** A negative pick (sad face, thumbs down, one or two
  stars) always asks "What went wrong?" with an optional text box. A positive
  pick submits and thanks the user at once. `showInput` loses its old meaning.
- **NPS.** A 0–10 scale on the rating shape. Component only, no block.
- **FeedbackForm.** "What happened?" plus one text box. It attaches the page
  URL and route, browser, OS, and viewport. No category picker.
- **Survey.** Pick one reason, then an optional note. For questions with known
  answers, such as why someone cancels.
- **After submit.** The thank-you stays on screen. Popovers and dialogs close
  themselves about two seconds after it appears. This replaces the current
  auto-hide default.

### Blocks

A block installs a ready-made file for one spot and pulls in the component it
uses.

| Block                    | Uses                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Floating feedback button | FeedbackForm. A small pill bottom-right; popover on desktop, bottom sheet on mobile |
| Header or menu item      | FeedbackForm in a dialog                                                            |
| Error page               | FeedbackForm inline in a Next.js `error.tsx`                                        |
| Was this helpful?        | Thumbs under docs, help articles, or AI answers                                     |
| After-task rating        | Emoji or Stars after checkout or onboarding                                         |
| Cancel-flow survey       | Survey inside a cancel-subscription dialog                                          |

### Site

- **Hero.** Leads with breakage: "Your app will break. Let users tell you in
  seconds."
- **Homepage.** Grouped by situation: "When something breaks", "After
  something works", "When someone leaves". Each group mixes components and
  blocks. One quiet hosted-inbox waitlist section follows.
- **Card.** A flat muted shell around an inset live preview, then title with a
  small meta, a two-line description, and a category label. Equal heights.
- **Component page.** The step 1 outline, with a variant switch, Replay (a
  scripted pick, type, send, thanks), and a mobile-width toggle in the preview.
- **Block page.** One toolbar with Preview and Code, desktop and mobile, and
  the install command, above a live mock app that shows the block in its spot.
- **Look.** Neutral base, violet primary, `--radius: 0.625rem`. No gradients
  or glows.

References studied: TuffUI (directory and card), shadcn/ui blocks (block
toolbar), and Tailark Pro (neutral canvas, hairlines, restrained accent).

### Process

Pen boards first for the new components, cards, homepage, and block page. Code
starts only after the boards are approved.

### Not at launch

Console errors and screenshots in reports, a toast block, an NPS prompt block,
and a category picker.

## Step 1 spec: UI consistency

Scope is the public site and docs. Widget behavior and props do not change in
this step.

Step 1 ships in two halves. The first half (landed in #63–#67) holds
regardless of components: one public noun, one shell, one preview frame, one
copy source, the component page outline, and the install story. The second
half (homepage content and order, directory grouping, the card meta line, and
the preview controls) is now specified by the launch spec; where the two
disagree, the launch spec wins.

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
