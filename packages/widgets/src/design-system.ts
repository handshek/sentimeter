import type { CSSProperties } from "react";

/** Scoped overrides. Fonts are supplied by the host; widgets never fetch assets. */
export type FeedbackStyle = CSSProperties & {
  [token: `--feedback-${string}`]: string | number | undefined;
};

const surfaceShadow =
  "0 0 0 1px var(--feedback-edge), 0 1px 2px var(--feedback-shadow-color), 0 8px 24px var(--feedback-shadow-color)";

// The widget reads the host's shadcn theme. Colors map to its semantic
// variables and corners follow its radius. Spacing is fixed.
export const feedbackTheme = {
  className:
    "[--feedback-surface:var(--card)] [--feedback-foreground:var(--card-foreground)] [--feedback-muted:var(--muted-foreground)] [--feedback-border:var(--border)] [--feedback-edge:color-mix(in_oklab,var(--foreground)_8%,transparent)] [--feedback-shadow-color:oklch(0_0_0/5%)] [--feedback-well:color-mix(in_oklab,var(--muted)_50%,var(--card))] [--feedback-input:var(--card)] [--feedback-hover:color-mix(in_oklab,var(--foreground)_4%,transparent)] [--feedback-selected:color-mix(in_oklab,var(--accent),var(--foreground)_6%)] [--feedback-selected-foreground:var(--foreground)] [--feedback-pick:var(--feedback-hover)] [--feedback-star:var(--primary)] [--feedback-primary:var(--primary)] [--feedback-primary-foreground:var(--primary-foreground)] [--feedback-ring:var(--ring)] [--feedback-field-ring:var(--ring)] [--feedback-field-glow:color-mix(in_oklab,var(--ring)_25%,transparent)] [--feedback-success:var(--success,oklch(0.55_0.14_155))] [--feedback-error:var(--destructive)] dark:[--feedback-shadow-color:oklch(0_0_0/40%)] dark:[--feedback-input:var(--background)] dark:[--feedback-success:var(--success,oklch(0.77_0.13_155))]",
  style: {
    "--feedback-inset": "1.25rem",
    "--feedback-gap": "1rem",
    "--feedback-radius": "calc(var(--radius, 0.5rem) + 4px)",
    "--feedback-well-radius": "var(--radius, 0.5rem)",
    "--feedback-inner-radius": "max(0px, calc(var(--radius, 0.5rem) - 4px))",
    "--feedback-control-radius": "max(0px, calc(var(--radius, 0.5rem) - 2px))",
    "--feedback-input-height": "6.5rem",
    "--feedback-target": "2.75rem",
    "--feedback-action-height": "2.5rem",
    "--feedback-glyph-size": "1.75rem",
    "--feedback-emoji-size": "1.5rem",
    "--feedback-icon-size": "1.25rem",
    "--feedback-icon-stroke": "1.75",
    "--feedback-heading-size": "1rem",
    "--feedback-heading-weight": "600",
    "--feedback-font": "inherit",
    "--feedback-heading-font": "inherit",
    "--feedback-label-font": "inherit",
    "--feedback-shadow": surfaceShadow,
    "--feedback-input-shadow": "none",
    "--feedback-action-shadow": "0 1px 2px var(--feedback-shadow-color)",
    "--feedback-selected-shadow": "0 1px 2px var(--feedback-shadow-color)",
  } satisfies FeedbackStyle,
};

export const feedbackSizes = {
  sm: { "--feedback-max-width": "20rem" },
  default: { "--feedback-max-width": "23rem" },
  md: { "--feedback-max-width": "25rem" },
  lg: {
    "--feedback-max-width": "27.5rem",
    "--feedback-target": "3rem",
    "--feedback-glyph-size": "2rem",
    "--feedback-emoji-size": "1.75rem",
    "--feedback-icon-size": "1.5rem",
  },
} as const;

// The inline bar uses compact 32 px choices; each keeps a 44 px tall hit area.
export const feedbackLayouts = {
  stacked: {},
  inline: {
    "--feedback-max-width": "22rem",
    "--feedback-shadow":
      "0 0 0 1px var(--feedback-edge), 0 2px 2px var(--feedback-shadow-color)",
    "--feedback-selected-shadow": "none",
    "--feedback-target": "2rem",
    "--feedback-glyph-size": "1.25rem",
    "--feedback-emoji-size": "1.125rem",
    "--feedback-icon-size": "1rem",
    "--feedback-action-height": "2rem",
    "--feedback-input-height": "5.5rem",
  },
} as const satisfies Record<string, FeedbackStyle>;

// The parent owns section spacing. Parts own only their internal spacing.
export const feedbackStyles = {
  root: "group/feedback relative w-full max-w-[var(--feedback-max-width)] rounded-[var(--feedback-radius)] bg-[var(--feedback-surface)] font-[family-name:var(--feedback-font)] text-sm leading-5 text-[var(--feedback-foreground)] shadow-(--feedback-shadow)",
  // Only the card queries its own width. The inline bar sizes to its content
  // until its footer opens.
  rootStacked: "@container/feedback",
  rootInline:
    "w-fit rounded-[calc(var(--feedback-radius)*2)] has-[[data-slot=feedback-footer]]:w-full has-[[data-slot=feedback-footer]]:rounded-[var(--feedback-radius)]",
  contentInline: "flex min-w-0 flex-col",
  // A finished card shows only its thank-you, centred at the idle height.
  content:
    "flex min-w-0 flex-col gap-[var(--feedback-gap)] p-4 @[320px]/feedback:p-[var(--feedback-inset)] group-data-[state=done]/feedback:justify-center group-data-[state=done]/feedback:[&>[data-slot=feedback-header]]:hidden group-data-[state=done]/feedback:[&>[data-slot=feedback-title]]:hidden group-data-[state=done]/feedback:[&>[data-slot=feedback-description]]:hidden group-data-[state=done]/feedback:[&>[data-slot=feedback-response]]:hidden",
  header: "flex min-w-0 flex-col gap-1.5",
  title:
    "font-[family-name:var(--feedback-heading-font)] text-[length:var(--feedback-heading-size)] leading-6 font-[number:var(--feedback-heading-weight)] tracking-[-0.01em] text-[var(--feedback-foreground)] [overflow-wrap:anywhere]",
  titleInline:
    "font-[family-name:var(--feedback-font)] text-sm leading-5 font-normal tracking-normal text-[var(--feedback-muted)]",
  description:
    "text-sm leading-5 text-[var(--feedback-muted)] [overflow-wrap:anywhere]",
  bar: "flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 ps-4 pe-2 group-data-[state=done]/feedback:hidden",
  focus:
    "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--feedback-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--feedback-surface)]",
  // One outline holds the rating, its note, and any context. Typing in the
  // note rings the whole group so the note never looks cut out of it.
  response:
    "flex min-w-0 flex-col overflow-hidden rounded-[var(--feedback-well-radius)] border border-[var(--feedback-border)] bg-[var(--feedback-input)] has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-[var(--feedback-ring)] has-[textarea:focus-visible]:ring-offset-2 has-[textarea:focus-visible]:ring-offset-[var(--feedback-surface)]",
  rating: "grid w-full grid-cols-5",
  thumbsRating: "grid-cols-2",
  starsRating: "[--feedback-icon-size:1.375rem]",
  inlineStarsRating: "[--feedback-icon-size:1.125rem]",
  inlineRating: "flex w-auto items-center gap-0.5",
  nps: "flex w-full min-w-0 flex-col",
  npsBands: "grid w-full grid-cols-3",
  npsBand:
    "px-2 font-[family-name:var(--feedback-label-font)] text-sm leading-5 font-medium",
  npsScores: "grid w-full border-t border-[var(--feedback-border)]",
  npsChoice: "text-sm tabular-nums",
  inlineNps: "flex flex-col items-end gap-1",
  inlineNpsRow: "flex flex-wrap items-center justify-end gap-0.5",
  inlineBand:
    "w-auto px-3 font-[family-name:var(--feedback-label-font)] text-[0.8125rem] leading-4 font-medium",
  npsSelected:
    "bg-[var(--feedback-primary)] text-[var(--feedback-primary-foreground)] hover:bg-[var(--feedback-primary)] hover:text-[var(--feedback-primary-foreground)] dark:bg-[var(--feedback-primary)] dark:hover:bg-[var(--feedback-primary)]",
  choice:
    "group/choice relative min-w-0 shrink-0 border-0 p-0 text-[var(--feedback-muted)] shadow-none transition-[transform,opacity] duration-150 hover:bg-[var(--feedback-hover)] hover:text-[var(--feedback-foreground)] dark:hover:bg-[var(--feedback-hover)] disabled:opacity-45 motion-reduce:transition-none",
  // A segment fills its cell, so its focus ring sits inside the outline.
  segment:
    "h-[var(--feedback-target)] w-full rounded-none border-0 border-s border-[var(--feedback-border)] first:border-s-0 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--feedback-ring)]",
  segmentSelected:
    "bg-[var(--feedback-pick)] text-[var(--feedback-foreground)] hover:bg-[var(--feedback-pick)] dark:bg-[var(--feedback-pick)] dark:hover:bg-[var(--feedback-pick)]",
  thumbChoice:
    "gap-2 px-3 [--feedback-icon-size:1.125rem] font-[family-name:var(--feedback-label-font)] text-sm leading-5 font-medium",
  inlineChoice:
    "size-[var(--feedback-target)] rounded-full after:absolute after:-inset-x-px after:-inset-y-1.5",
  selected:
    "bg-[var(--feedback-selected)] text-[var(--feedback-selected-foreground)] shadow-(--feedback-selected-shadow) hover:bg-[var(--feedback-selected)] hover:text-[var(--feedback-selected-foreground)] dark:bg-[var(--feedback-selected)] dark:hover:bg-[var(--feedback-selected)]",
  thumbLabel: "min-w-0 truncate",
  filledStar: "text-[var(--feedback-star)] hover:text-[var(--feedback-star)]",
  submittedChoice: "disabled:opacity-100",
  glyph:
    "pointer-events-none inline-flex size-[var(--feedback-glyph-size)] shrink-0 select-none items-center justify-center text-[length:var(--feedback-emoji-size)] leading-none grayscale transition-[transform,opacity] duration-150 motion-reduce:transition-none [&_img]:size-full [&_img]:object-contain [&_svg]:size-[var(--feedback-icon-size)]! [&_svg]:stroke-[length:var(--feedback-icon-stroke)] group-hover/choice:grayscale-0 group-data-[state=selected]/choice:grayscale-0",
  filledGlyph: "grayscale-0 [&_svg]:fill-current",
  field:
    "flex min-w-0 flex-col border-t border-[var(--feedback-border)] first:border-t-0",
  inlineField: "border-t-0 px-2 pb-2 group-data-[state=done]/feedback:hidden",
  // The inline bar draws the field as its own outline.
  inlineInput:
    "rounded-[var(--feedback-control-radius)] border border-[var(--feedback-input-edge,var(--input))] bg-transparent shadow-none focus-visible:border focus-visible:border-[var(--feedback-field-ring)] focus-visible:ring-3 focus-visible:ring-[var(--feedback-field-glow)] dark:bg-transparent",
  label: "sr-only",
  // Inside the response group the field has no box of its own.
  input:
    "h-[var(--feedback-input-height)] min-h-0 field-sizing-fixed w-full resize-none rounded-none border-0 bg-transparent px-3 py-2.5 text-base leading-5 text-[var(--feedback-foreground)] shadow-(--feedback-input-shadow) placeholder:text-[var(--feedback-muted)] focus-visible:border-0 focus-visible:ring-0 md:text-sm dark:bg-transparent transition-none",
  surveyOptions: "flex min-w-0 flex-col",
  surveyOption:
    "h-auto min-h-11 w-full min-w-0 justify-start gap-3 rounded-none border-s-0 border-t first:border-t-0 px-3 py-2 text-left text-sm leading-5 font-normal whitespace-normal [overflow-wrap:anywhere] text-[var(--feedback-foreground)] hover:bg-[var(--feedback-hover)] disabled:opacity-60 after:hidden transition-[transform,opacity] motion-reduce:transition-none",
  surveyRadio:
    "size-4 shrink-0 rounded-full border border-[var(--feedback-border)] bg-[var(--feedback-input)]",
  surveyRadioSelected:
    "border-[var(--feedback-primary)] bg-[var(--feedback-primary)] after:mx-auto after:my-1 after:block after:size-1.5 after:rounded-full after:bg-[var(--feedback-primary-foreground)]",
  context:
    "border-t border-[var(--feedback-border)] bg-[var(--feedback-well)] px-3 py-2 text-xs leading-4 text-[var(--feedback-muted)] [overflow-wrap:anywhere]",
  footer: "flex min-w-0 flex-col gap-2",
  inlineFooter:
    "flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-[var(--feedback-border)] py-2.5 ps-4 pe-2.5",
  hint: "me-auto text-xs leading-4 text-[var(--feedback-muted)]",
  actions: "grid min-w-0 auto-cols-fr grid-flow-col gap-3",
  inlineActions: "flex items-center gap-1",
  action:
    "relative h-auto min-h-[var(--feedback-action-height)] min-w-0 gap-2 rounded-[var(--feedback-control-radius)] px-4 py-2 text-sm leading-5 font-medium whitespace-normal [overflow-wrap:anywhere] after:absolute after:inset-x-0 after:-inset-y-1 transition-[transform,opacity] motion-reduce:transition-none",
  compactAction: "px-3 py-1 text-[0.8125rem] leading-4 after:-inset-y-1.5",
  submit:
    "border-transparent bg-[var(--feedback-primary)] text-[var(--feedback-primary-foreground)] shadow-(--feedback-action-shadow) hover:bg-[var(--feedback-primary)] hover:brightness-95",
  cancel:
    "border-[var(--feedback-border)] bg-[var(--feedback-input)] text-[var(--feedback-foreground)] shadow-(--feedback-action-shadow) hover:bg-[var(--feedback-well)] hover:text-[var(--feedback-foreground)] dark:border-[var(--feedback-border)] dark:bg-[var(--feedback-input)] dark:hover:bg-[var(--feedback-well)]",
  ghostCancel:
    "border-transparent bg-transparent px-2.5 text-[var(--feedback-muted)] shadow-none hover:bg-[var(--feedback-hover)] hover:text-[var(--feedback-foreground)] dark:border-transparent dark:bg-transparent dark:hover:bg-[var(--feedback-hover)]",
  success:
    "flex min-h-[var(--feedback-action-height)] flex-col items-center justify-center gap-1 text-center text-sm leading-5 text-[var(--feedback-foreground)] [overflow-wrap:anywhere]",
  successBadge:
    "mb-2 flex size-10 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--feedback-success)_14%,transparent)] text-[var(--feedback-success)] [&_svg]:size-5",
  successTitle: "font-semibold",
  successDescription: "text-[var(--feedback-muted)]",
  inlineSuccess:
    "min-h-12 flex-row justify-start gap-2 ps-3.5 pe-4 text-start font-normal",
  statusIcon: "size-4 shrink-0 text-[var(--feedback-success)]",
  error:
    "flex items-start gap-1.5 text-[0.8125rem] leading-[1.125rem] text-[var(--feedback-error)] [overflow-wrap:anywhere]",
  inlineError: "me-auto text-xs leading-4",
  errorIcon: "mt-0.5 size-3.5 shrink-0",
  inlineErrorIcon: "mt-0 size-3.5",
  close:
    "absolute top-3 right-3 z-20 size-7 rounded-[var(--feedback-control-radius)] text-[var(--feedback-muted)] after:absolute after:-inset-2 hover:bg-[var(--feedback-hover)] hover:text-[var(--feedback-foreground)] dark:hover:bg-[var(--feedback-hover)] transition-[transform,opacity] motion-reduce:transition-none",
  inlineClose: "top-2 right-2 size-8",
  closeHeader:
    "[&>[data-slot=feedback-header]]:pr-9 [&>[data-slot=feedback-title]]:pr-9 [&:not(:has(>[data-slot=feedback-header],>[data-slot=feedback-title]))]:pt-10",
  inlineCloseBar: "[&>[data-slot=feedback-bar]]:pe-11",
} as const;
