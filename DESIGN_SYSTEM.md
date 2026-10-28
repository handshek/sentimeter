# Sentimeter design system

Sentimeter uses one visual language across its public website, documentation,
product UI, and installable feedback widgets. The default is precise and
shadcn-native: clear type, neutral surfaces, a violet primary, useful space,
and a consistent response to interaction.

The live reference starts at [/design-system](https://try-sentimeter.vercel.app/design-system).
Its eight chapters contain working specimens, the type scale, light/dark
palettes, layout rules, components, and complete product patterns. This file is
the implementation contract for contributors. Runtime values live in source;
update the specimens and this guide when that contract changes.

## Scope and source ownership

| Source                                                          | Owns                                                                                               |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [globals.css](packages/ui/src/styles/globals.css)               | Shadcn semantic color pairs, light/dark themes, radius, Tailwind mappings, and reduced motion      |
| [foundations.css](packages/ui/src/styles/foundations.css)       | Shared typography, page measures, spacing, surface, elevation, and motion roles                    |
| [Root layout](apps/web/app/layout.tsx)                          | Local Geist Sans/Mono loading and the app-wide theme context                                       |
| [Installed shadcn primitives](packages/ui/src/components)       | Buttons, labels, fields, selects, tabs, tables, overlays, and other interaction foundations        |
| [Design-system reference](apps/web/app/design-system)           | Live foundations, states, and composition examples; shared chapter navigation and specimen framing |
| [Landing compositions](apps/web/app/_components/landing)        | Marketing applications of the same foundations                                                     |
| [Documentation adapter](apps/web/app/components/docs.css)       | Fumadocs semantic mapping and reading/navigation layout                                            |
| [Widget recipes](packages/widgets/src/design-system.ts)         | Scoped widget anatomy, size, and theme recipe                                                      |
| [Widget compound parts](packages/widgets/src/compound/index.ts) | Shared interaction anatomy used by all widget families                                             |
| [Registry adapter](apps/registry/scripts/registry-adapter.ts)   | Emission of canonical widget source into installable registry items                                |

The website and documentation use these foundations directly. Dashboard layout,
project views, panels, synchronization/error states, hosted-provider messages,
sign-in/sign-up shells, and legal pages also use the shared presentation. Clerk
appearance is mapped to the same theme; authentication, analytics behavior, and
legal copy remain unchanged. Product patterns demonstrate analytics, settings,
validation, empty, and error states without requiring an account. Those pattern
specimens are local examples, not live analytics or account settings. Verify
authenticated flows separately when modifying those routes.

This workflow follows Arlan's
[build-design-system](https://github.com/arla6ka/skills/blob/main/skills/build-design-system/SKILL.md),
[shadcn foundation rules](https://github.com/arla6ka/skills/blob/main/skills/build-design-system/references/base-shadcn.md),
and [token-mapping](https://github.com/arla6ka/skills/blob/main/skills/token-mapping/SKILL.md):
name values by their purpose, compose existing primitives, prove the rules in real
flows, and enforce recurring mistakes with focused checks. No additional skill
installation or replacement primitive library is required.

## Typography and font roles

Geist Sans is the actual default body and display face. Geist Mono is the actual
code face. Both are local variable files loaded at the root, exposed through
`--font-geist-sans` and `--font-geist-mono`, then mapped to `--ds-font-body`,
`--ds-font-code`, and Tailwind's `font-sans`/`font-mono`. The app does not need a
font-service request at build time or in the browser.

Use a role for its intended hierarchy rather than selecting a new size for every
heading. Semantic HTML remains independent: a `ds-title` can be an `h2` in a
small panel, while the page still has one primary `h1`.

| Utility            | Size / line height    | Weight / tracking | Intended use                                               |
| ------------------ | --------------------- | ----------------- | ---------------------------------------------------------- |
| `ds-display`       | Fluid 44–72 px / 1.04 | 600 / −0.055em    | One marketing promise, never a dashboard panel heading     |
| `ds-page-title`    | Fluid 32–44 px / 1.12 | 600 / −0.04em     | Page subject in docs, reference, and product UI            |
| `ds-section-title` | Fluid 28–36 px / 1.16 | 600 / −0.035em    | A major idea within a page                                 |
| `ds-title`         | 20 px / 1.3           | 600 / −0.02em     | Cards, groups, dialogs, and compact sections               |
| `ds-heading`       | 16 px / 1.5           | 600 / −0.01em     | Item titles in lists, cards, and FAQs; the widget question |
| `ds-lead`          | Fluid 18–20 px / 1.65 | 400 / −0.015em    | Page introductions                                         |
| `ds-body`          | 16 px / 1.65          | 400 / −0.01em     | Explanations and documentation                             |
| `ds-body-sm`       | 14 px / 1.6           | 400 / −0.005em    | Descriptions under item titles; notes under specimens      |
| `ds-label`         | 14 px / 1.43          | 500 / −0.005em    | Navigation, form labels, and compact supporting UI         |
| `ds-caption`       | 12 px / 1.5           | 400 / 0           | Metadata only: footers, chrome labels, timestamps          |
| `ds-code`          | 13 px / 1.6           | 400 / −0.02em     | Commands, identifiers, and code                            |
| `ds-eyebrow`       | 11 px / 1.5           | Mono 500 / 0.1em  | Short uppercase editorial labels, used sparingly           |

An item in a list (steps, features, FAQs, anatomy) pairs a `ds-heading` title
with a `ds-body-sm` muted description, the same 16 / 14 relationship as the
widget's question and description. Do not set descriptive sentences in
`ds-caption`.

Titles balance their lines; body and lead copy use readable wrapping. Use
`ds-reading` to keep paragraphs within `--ds-reading-width` (65ch). Avoid long
all-caps text and do not reduce a field's accessible label to an eyebrow.
Existing shadcn primitives keep their own compact type where appropriate.

## Color and surfaces

Color values belong in `globals.css`; the component API is their semantic role.
The site runs shadcn's **Vega** style on the **Neutral** base (radius
0.625rem) with Sentimeter's violet as `primary` and `ring`, the theme the
approved widget designs were drawn on. Light mode uses a white canvas and cards
with a neutral inset; dark mode uses a near-black canvas and slightly raised
cards. Violet marks primary actions, selection emphasis such as filled stars,
and keyboard focus. `accent` is a neutral interaction surface, so every hover
does not become a colored block. Success is green and always paired with an
icon and words.

| Role pair                                           | Meaning                                                              |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `background` / `foreground`                         | Page canvas and primary text                                         |
| `card` / `card-foreground`                          | A contained area at the page surface                                 |
| `popover` / `popover-foreground`                    | Menus, selects, and floating UI                                      |
| `muted` / `muted-foreground`                        | Inset context and secondary text                                     |
| `primary` / `primary-foreground`                    | The main action or selected emphasis                                 |
| `secondary` / `secondary-foreground`                | A quieter action                                                     |
| `accent` / `accent-foreground`                      | Hover and neutral active surfaces                                    |
| `border` / `input`                                  | Structural separators / form-control edges                           |
| `ring`                                              | An independent, visible keyboard-focus indicator                     |
| `destructive`                                       | Destructive actions and errors                                       |
| `brand`                                             | The logo mark; currently an alias of `primary`                       |
| `success` / `success-foreground` / `success-subtle` | Successful outcome, paired solid foreground, and tonal background    |
| `warning` / `warning-foreground` / `warning-subtle` | Attention required, paired solid foreground, and tonal background    |
| `info` / `info-foreground` / `info-subtle`          | Informational context, paired solid foreground, and tonal background |

For a tonal status, use `bg-success-subtle text-success` (or the corresponding
warning/info pair). A solid status uses its `*-foreground`. Pair state color
with words and an appropriate icon; hue alone must never carry the result.
Keep the same semantic classes in both themes and let the theme supply values.

Body and primary pairs exceed 15:1. The stock muted foreground is about 4.7:1 on
white (WCAG AA for body text) and 7:1 in dark mode, so keep long secondary copy
at 14 px or larger. The status pairs were calculated above 6:1. That does not make arbitrary overlays, opacity,
new backgrounds, or every component automatically accessible. Verify the actual
rendered pairing, including focus and hover, whenever changing the theme.

## Space, layout, shape, and depth

Use the 4 px spacing grid. Typical relationships are 4 px between a label and its
support, 8 px within a control group, 12–16 px between related pieces, 24 px
between content groups, and 32 px between larger groups. Space belongs to the
container arranging the content; children should not compete with outer margins.

| Role                  | Contract                                                            |
| --------------------- | ------------------------------------------------------------------- |
| `ds-container`        | Centered content, at most 1200 px, with fluid 20–32 px side gutters |
| `ds-section`          | Fluid 64–112 px vertical spacing for major marketing sections       |
| `ds-reading`          | Maximum 65ch paragraph measure                                      |
| `ds-stack`            | Vertical composition using `--ds-stack-gap`, default 24 px          |
| `--ds-panel-inset`    | Fluid 20–32 px padding for large compositions                       |
| `ds-panel`            | Card surface, hairline edge ring, 12 px radius, soft contact depth  |
| `ds-inset`            | Recessed well: muted/50 surface, 1 px border, 8 px radius           |
| `--ds-edge`           | The hairline edge: foreground at 8 %, drawn as a ring, not a border |
| `--ds-radius-control` | 6 px from the shared 8 px base radius                               |
| `--ds-shadow-panel`   | Edge ring plus low depth for panels and cards                       |
| `--ds-shadow-raised`  | Edge ring plus ambient depth; the feedback widget and floating UI   |

The underlying radius hierarchy remains shadcn's `--radius` and its derived
small/medium/large/extra-large values. Nested layers step down: panel
(`--radius` + 4), well (`--radius`), then the tile or field inside it
(`--radius` − 4). The edge is a ring, so swapping a border for it never shifts
layout. Shadcn `Card` uses the same panel depth. Use meaningful differences between
surfaces instead of making every nested piece another raised card. Shadows have
light and dark values; change the shared role, not a local hardcoded shadow.

Responsive composition should change its structure before compressing controls.
Stack split layouts on small screens, let action rows wrap, and preserve readable
labels. The reference uses a 208 px sidebar on desktop and a labeled chapter
Select on mobile. Documentation can have wider navigation framing while its prose
keeps a reading measure. Tables and code may scroll inside a named region; the
page itself must not overflow. Check 320 px as well as comfortable desktop widths.

## Composition recipes

| Surface       | Composition                                                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing       | Shared header; one display promise with a real widget; concise supporting copy; clear install action; alternating examples and explanation; shared footer |
| Documentation | Chapter navigation, page title and lead, a bounded live preview, exact commands, then grouped API details; code and tables remain scannable               |
| Analytics     | Page title and operational actions, aligned metric groups, tabular numbers, response table; reserve display scale for marketing                           |
| Settings      | Descriptive group heading, persistent field labels, nearby help/validation, separated action row, explicit save and discard                               |
| Empty state   | Explain why the region is empty and offer one useful next action; preserve the surrounding context                                                        |
| Error state   | Explain the failed operation near its region, retain useful input/context, offer retry, and announce the result accessibly                                |

The [pattern specimens](apps/web/app/design-system/_components/pattern-specimens.tsx)
exercise these relationships with working local state. Their data is explicitly
sample data. Reuse the hierarchy and behavior of a recipe; do not copy a whole
page of utility values into each new screen.

## Components, icons, motion, and accessibility

Use the installed shadcn Button, Input, Textarea, Label, Select, Tabs, Table,
Badge, Switch, and overlays. Install a missing primitive from shadcn rather than
creating another custom implementation. Product-specific page compositions are
built from those primitives and ordinary semantic structure.

Every interactive component needs its applicable default, hover, keyboard-focus,
selected, disabled, pending, success, and error states. Keep selection distinct
from focus. Labels persist after typing; helper text and errors are connected
with `aria-describedby`. Do not use placeholders as the only field name. The one
exception is the widget's optional comment: a visually hidden label names it,
the rating above gives it context, and the placeholder is only a hint. Pending
operations block duplicate submission while preserving context and dimensions.
Status messages use a single suitable live region. Return focus appropriately
after dismissal, and keep navigation reachable with the keyboard.

Lucide is the shared icon family. Use 16 px for inline/dense details, 20 px for
navigation and controls, and 24 px for emphasized feedback. Product specimens
use a 1.75 px stroke.

Controls keep shadcn's stock 36 px (Button, Input, SelectTrigger, TabsList;
`size="sm"` is 32 px and `size="lg"` is 40 px for marketing calls to action). Every interactive control keeps a hit
area of at least 44 px: the primitives extend it invisibly with a pseudo
element, so a smaller drawn size never means a smaller target. Do not override
primitive heights in page code; `site/control-size` rejects it. A text
input cannot draw a pseudo element, so an Input keeps its 36 px field and
always has a persistent visible Label: clicking the label focuses the field,
and together they exceed 44 px. When tabs do not fit their row, put the
TabsList in a wrapper with `overflow-x-auto py-2 -my-2` so it scrolls in one
row without clipping the triggers' hit areas. Links without a
visible box keep `min-h-11` as their target.
Decorative icons have `aria-hidden`; icon-only actions have an accessible name.
Native emoji remains a deliberate widget option with platform-dependent rendering.

Motion communicates a state change. Use `--ds-duration-fast` (120 ms) for color
and control feedback, `--ds-duration-normal` (180 ms) for a small disclosure, and
`--ds-ease` for their shared easing. Avoid decorative motion in operational UI.
The global reduced-motion rule removes interpolation while preserving every
state cue. The motion specimen also has a local reduction toggle so this can be
inspected without changing operating-system settings.

Use visible focus (`focus-visible:ds-focus` for suitable links/custom composition
boundaries, or the primitive's own focus treatment), semantic heading order,
keyboard-complete navigation, and meaningful live-region messages. A design
system is not accessibility certification; verify the actual rendered flow.

## Widget library contract

The widget has two layouts, the stacked grouped card and the inline bar, and
one theme recipe. Installed widgets read their host application's
shadcn theme; they do not install Sentimeter's site stylesheet, change the
host's global palette, or fetch fonts. Runtime recipes in `design-system.ts`
remain authoritative.

### Composition

Two layouts share every part and state:

- **Stacked** (default) is a card: a heading, one recessed response well that
  holds the rating and, after a choice, the comment, then a paired Cancel and
  Submit row.
- **Inline** (`layout="inline"`) is a one-line bar: a muted question beside
  compact choices. A choice opens it into a card with the comment and a footer
  strip; Cancel or a sent response collapses it back to a bar of the same
  height. The description is not shown inline.

The stacked rhythm is 6 / 16 / 20 px: 6 between question and description, 16
between groups, and a 20 px card inset (16 px below a 320 px container). The
well has a 4 px inset and 4 px between its rating and comment.

| Part          | Contract                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| Surface       | One card, one hairline edge drawn as a ring, soft two-layer depth. Host semantic colors by default.              |
| Header        | A 16 px semibold question first, an optional muted description second.                                           |
| Response well | `FeedbackResponse`: a muted/50 recessed group, radius `--radius`, holding the rating and the comment.            |
| Rating        | Evenly spaced 44 px tiles. Glyphs stay grayscale until hovered or chosen; the choice lifts onto a tile in color. |
| Stars         | Bare tiles with cumulative fill in the primary color; selection and keyboard focus remain distinct.              |
| Comment       | Opens inside the well after a choice. A visually hidden label names it; the placeholder is a hint.               |
| Actions       | Cancel and Submit as an equal 40 px pair. Cancel clears an unsent choice; `closeButton` dismisses the widget.    |
| Confirmation  | A status line replaces the action row at the same height; the submitted comment stays read-only.                 |

The parent owns section gaps. Parts own internal gaps and do not add competing
outer margins. Omit an optional part entirely when it is not needed; do not leave
an empty header or spacer. A new widget family should compose the existing parts
and add behavior only for a new response type.

```tsx
<FeedbackWidget widgetType="emoji" autoHide={false}>
  <div data-slot="feedback-header" className="flex flex-col gap-1.5">
    <FeedbackTitle>How was your experience?</FeedbackTitle>
    <FeedbackDescription>Your feedback helps us improve.</FeedbackDescription>
  </div>
  <FeedbackResponse>
    <FeedbackRating variant="emoji" />
    <FeedbackInput />
  </FeedbackResponse>
  <FeedbackFooter />
</FeedbackWidget>
```

Compositions written before `FeedbackResponse` still render; they simply have no
well. Rating tiles are 44 px at every size (48 px at `lg`); inline choices are
32 px circles with a 44 px tall hit area. Glyphs are 28 px boxes: emoji at 24 px
and icons at 20 px. Existing `sm`, `default`, `md`, and `lg` options set the
card's maximum width.

### Glyphs

`variant` picks a built-in set: native emoji (the `EmojiFeedback` default) or
Lucide icons. `glyphs` (faces, thumbs) and `glyph` (stars) replace the set with
anything renderable: an emoji string, an icon element, an `<img>`, or
`{ glyph, label }` for an accessible name. The scale never changes: faces take
five glyphs worst to best (values 1–5), thumbs take two in display order (like
= 1, dislike = 0), and stars take one glyph repeated five times. Custom submit
payload values are therefore unaffected by presentation.
A list of the wrong length falls back to the built-in set and warns.

### Theme

The theme recipe maps its surface, foreground, border, muted text, field,
selection, primary action, focus, and error roles to the host's shadcn
variables, derives the well and edge from them with `color-mix`, and follows
the host radius hierarchy. It does not replace the host's `:root`, `.dark`,
font loading, or global CSS. Keyboard focus and the comment field use the host
`ring`. Success uses the host `--success` when it exists and a green fallback
otherwise, so the confirmation check is always green.

Widgets make no font requests and inherit the host font. `--feedback-font`,
`--feedback-heading-font`, and `--feedback-label-font` can point at the
application's existing font variables. Dark values respond to the host's
Tailwind `dark` variant.

### Usage and overrides

```tsx
import { EmojiFeedback } from "@workspace/widgets";

<EmojiFeedback
  title="How was your experience?"
  description="Your feedback helps us improve."
  showInput
  autoHide={false}
/>;
```

The workspace import above is for Sentimeter's own app. In an installed project,
use the component path generated by the shadcn registry.

Use `className` for placement and width. Use the typed `style` prop for a
deliberate scoped token override:

```tsx
<EmojiFeedback
  showInput
  autoHide={false}
  style={{
    "--feedback-heading-font": "var(--font-heading)",
    "--feedback-font": "var(--font-sans)",
    "--feedback-gap": "1rem",
  }}
/>
```

The override belongs to that instance and cascades to its parts. Change paired
roles together: a primary action background needs its primary foreground; a
selected tile needs its selected foreground. Verify contrast after overriding
colors. Do not reach into a widget's DOM with page-specific selectors.

| Variable group                                                                                                                              | Purpose                 |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `--feedback-surface`, `--feedback-foreground`, `--feedback-muted`, `--feedback-border`, `--feedback-edge`                                   | Card and readable text  |
| `--feedback-shadow`, `--feedback-shadow-color`                                                                                              | Card depth              |
| `--feedback-well`, `--feedback-hover`                                                                                                       | Response well and hover |
| `--feedback-selected`, `--feedback-selected-foreground`, `--feedback-selected-shadow`, `--feedback-star`                                    | Selected rating         |
| `--feedback-input`, `--feedback-input-height`, `--feedback-input-shadow`, `--feedback-field-ring`, `--feedback-field-glow`                  | Comment field           |
| `--feedback-primary`, `--feedback-primary-foreground`, `--feedback-action-shadow`, `--feedback-action-height`                               | Actions                 |
| `--feedback-ring`, `--feedback-success`, `--feedback-error`                                                                                 | Focus and outcome       |
| `--feedback-inset`, `--feedback-gap`, `--feedback-radius`, `--feedback-well-radius`, `--feedback-inner-radius`, `--feedback-control-radius` | Composition and shape   |
| `--feedback-target`, `--feedback-glyph-size`, `--feedback-emoji-size`, `--feedback-icon-size`, `--feedback-icon-stroke`                     | Tile and glyph geometry |
| `--feedback-font`, `--feedback-heading-font`, `--feedback-label-font`, `--feedback-heading-size`, `--feedback-heading-weight`               | Typography roles        |

Keep shared styling in `feedbackStyles`. A recurring visual change belongs in a
named recipe or role there, with examples across the three families, both
layouts, and both themes. `feedbackStyles` is an internal composition helper;
the public package exports `FeedbackStyle` for scoped overrides.

### Parts and inspection hooks

The compound API exposes `FeedbackWidget`, `FeedbackTitle`,
`FeedbackDescription`, `FeedbackResponse`, `FeedbackRating`, `FeedbackInput`,
and `FeedbackFooter`. Place them inside one `FeedbackWidget` so selection,
comment, submission, and disabled state share the same context. The
convenience widgets build this composition for you.

| Slot                                     | Element                                    |
| ---------------------------------------- | ------------------------------------------ |
| `feedback-widget`                        | Widget root                                |
| `feedback-header`                        | Grouped question and description (stacked) |
| `feedback-bar`                           | Question and choices on one row (inline)   |
| `feedback-title`, `feedback-description` | Header content                             |
| `feedback-response`                      | The recessed well (stacked)                |
| `feedback-rating`                        | Named response group                       |
| `feedback-choice`                        | One rating button                          |
| `feedback-glyph`                         | The glyph inside a choice                  |
| `feedback-field`                         | Optional comment label and control         |
| `feedback-footer`                        | Actions and nearby submission feedback     |
| `feedback-status`                        | Successful confirmation                    |

The root also exposes `data-layout` and the public state through
`data-state`. A choice exposes `data-state="selected"` or `"idle"` and
`aria-pressed`. Native and ARIA attributes remain the source for interaction
semantics; data attributes do not replace them.

### State and lifecycle contract

The public state vocabulary remains `idle`, `selected`, `submitting`, and `done`.
An error accompanies a selected response so retry can resubmit the retained
reaction and comment.

| State      | Behavior                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------- |
| Idle       | Response choices are available. Comment and actions appear after a choice.                    |
| Selected   | The selected value is exposed accessibly. Submission is explicit.                             |
| Reset      | Cancel clears the unsent choice and comment, returns to idle, and focuses the first choice.   |
| Submitting | Keep the response, comment, action footprint and pending feedback; block repeated submission. |
| Failure    | Keep entered data, show the error near the action, and provide "Try again".                   |
| Done       | Show confirmation; retain submitted text as read-only content (inline collapses to its bar).  |
| Disabled   | Prevent activation while keeping the context readable.                                        |
| Dismissed  | `closeButton` closes the whole widget and uses the existing focus-restoration behavior.       |

`onReset` fires after Cancel; `onCancel` fires when the close button dismisses
the widget. Once submission starts, the stacked footer retains at least its
measured action height for that mounted widget, so shorter pending, retry, or
confirmation copy cannot collapse it.

Selection must not replace the keyboard-focus ring. Focus is independently
visible around the active control. Icon-only choices need useful accessible
names. Status and errors should announce once, without several competing live
regions reading the same update. Reduced-motion users must retain all state
cues without requiring animation.

The existing lifecycle defaults remain `autoHide={true}` and
`doneDurationMs={2000}`. For feedback embedded in page flow, use
`autoHide={false}` when a persistent confirmation is desired. If auto-hide is
enabled, the host must reserve the widget's footprint to avoid a later page
shift; the component does not reserve space after dismissal. Floating placement
is owned by the host.

## Governance and verification

Run `bun run check-design`. It exercises deliberately failing and passing
fixtures, then runs both TypeScript-AST source guards. CI already invokes the
same command. A new widget must use the compound parts and canonical recipes;
a new website surface should use the shared foundations and installed primitives.

| Rule                   | Prevents                                              | Use instead                                                         |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| `site/raw-color`       | Literal palette values in presentation                | Semantic roles from `globals.css`                                   |
| `site/palette-color`   | Tailwind palette shades and black/white choices       | `background`, `foreground`, `primary`, status, or other named roles |
| `site/font-family`     | Untracked literal font overrides                      | Loaded font variables or `font-sans`/`font-mono`                    |
| `site/raw-type`        | Arbitrary type sizes and direct numeric sizes         | `ds-*` roles or semantic type variables                             |
| `site/control-size`    | Height overrides on Button, Input, Select, and Tabs   | The primitive's `size`; it already provides the 44 px hit area      |
| `widget/raw-color`     | Literal color values outside widget recipes           | Host or feedback semantic roles                                     |
| `widget/palette-color` | Independent palette choices in widget parts           | Semantic classes or `feedbackStyles`                                |
| `widget/raw-control`   | Duplicated raw button, textarea, input, and label JSX | Installed shadcn primitives                                         |
| `widget/raw-shape`     | Independent radius/shadow values in parts             | Shared widget recipe variables                                      |

The site guard is deliberately scoped to the migrated React sources under
`app/design-system`, `app/_components/landing`, and `app/components/_components`.
It inspects presentation attributes, recognized style properties, class helpers,
and named class declarations; explanatory prose and code-example strings are not
presentation. It is a static drift detector, not a data-flow analyzer. It does
not scan global CSS, font loaders, third-party primitives, or automatically
assert that every older route is migrated. Add further source roots deliberately
as their visual contract is reviewed. The widget guard scans
`packages/widgets/src`, excluding its canonical recipe and test fixtures.

The checks permit ordinary layout utilities, structural HTML, semantic variables,
and targeted font specimens. Do not add a rule merely to forbid flexible syntax:
identify a recurring inconsistency, seed its failure, and supply a nearest
correct example. Do not add broad exclusions just to make a failed check pass.

For presentation changes, also run the relevant interaction tests, type checking,
lint, and a production build. Widget changes additionally require
`bun run check-registry` so installed output matches workspace behavior. Browser
verification covers light/dark mode, narrow/desktop widths, real font loading,
long text, keyboard focus, pointer targets, contrast, overflow, and every changed
state. Exercise navigation, form validation, pending, retry, and confirmation;
check reduced motion and verify no visible layout collapse after submission.
Authenticated flows require their own configured validation, beyond the public
sample patterns. A passing guard does not establish visual or accessibility
approval.

When extending the system:

1. Reuse a role or recipe where one already expresses the relationship.
2. If a new role is necessary, change its canonical owner and explain its purpose.
3. Show it in a real composition and all relevant interaction states.
4. Update the live chapter and this contract together.
5. Run the source checks and inspect the rendered result before calling the
   change complete.
