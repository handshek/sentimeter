"use client";

import * as React from "react";
import { LoaderCircle, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { feedbackStyles } from "../design-system";
import type { FeedbackGlyph } from "../types";
import { useFeedbackContext } from "./feedback-context";

type Choice = { value: number; label: string; glyph: React.ReactNode };

const FACES = [
  { value: 1, label: "Angry", emoji: "😖" },
  { value: 2, label: "Sad", emoji: "😕" },
  { value: 3, label: "Neutral", emoji: "😐" },
  { value: 4, label: "Happy", emoji: "😊" },
  { value: 5, label: "Delighted", emoji: "😍" },
] as const;

// Display order: the positive response first.
const THUMBS = [
  { value: 1, label: "Yes", Icon: ThumbsUp },
  { value: 0, label: "No", Icon: ThumbsDown },
] as const;

const EXPECTED_GLYPHS = { emoji: 5, thumbs: 2, stars: 1 } as const;

// NPS asks a plain question first, then shows only that answer's scores.
const NPS_BANDS = [
  { label: "Not likely", scores: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Maybe", scores: [7, 8] },
  { label: "Very likely", scores: [9, 10] },
] as const;

type NpsBand = (typeof NPS_BANDS)[number];

/** Arrow keys, Home, and End move focus among the choices in one row. */
function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>) {
  const choices = Array.from(
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      '[data-slot="feedback-choice"]',
    ) ?? [],
  );
  const index = choices.indexOf(event.currentTarget);
  let next: number;
  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      next = (index + 1) % choices.length;
      break;
    case "ArrowLeft":
    case "ArrowUp":
      next = (index - 1 + choices.length) % choices.length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = choices.length - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  choices[next]?.focus();
}

export type FeedbackRatingProps = {
  variant: "emoji" | "stars" | "thumbs" | "nps";
  /**
   * Custom glyphs, replacing the built-in set. Faces take five (worst to
   * best), thumbs take two (like, then dislike), stars take one, repeated.
   */
  glyphs?: readonly FeedbackGlyph[];
  className?: string;
};

function isGlyphObject(
  glyph: FeedbackGlyph,
): glyph is { glyph: React.ReactNode; label?: string } {
  return (
    typeof glyph === "object" &&
    glyph !== null &&
    !Array.isArray(glyph) &&
    !React.isValidElement(glyph) &&
    "glyph" in glyph
  );
}

function readGlyph(glyph: FeedbackGlyph) {
  return isGlyphObject(glyph)
    ? { node: glyph.glyph, label: glyph.label }
    : { node: glyph as React.ReactNode, label: undefined };
}

type GlyphVariant = Exclude<FeedbackRatingProps["variant"], "nps">;

function builtInChoices(variant: GlyphVariant): Choice[] {
  if (variant === "stars") {
    return FACES.map(({ value }) => ({
      value,
      label: `Rate ${value} star${value === 1 ? "" : "s"}`,
      glyph: <Star aria-hidden="true" />,
    }));
  }
  if (variant === "thumbs") {
    return THUMBS.map(({ value, label, Icon }) => ({
      value,
      label,
      glyph: <Icon aria-hidden="true" />,
    }));
  }
  return FACES.map(({ value, label, emoji }) => ({
    value,
    label: `${label} (${value} of 5)`,
    glyph: emoji,
  }));
}

function customChoices(
  variant: GlyphVariant,
  glyphs: readonly FeedbackGlyph[],
): Choice[] {
  if (variant === "stars") {
    const { node, label } = readGlyph(glyphs[0]);
    return FACES.map(({ value }) => ({
      value,
      label: label
        ? `Rate ${value} ${label}${value === 1 ? "" : "s"}`
        : `Rate ${value} star${value === 1 ? "" : "s"}`,
      glyph: node,
    }));
  }
  if (variant === "thumbs") {
    return THUMBS.map(({ value, label: fallback }, index) => {
      const { node, label } = readGlyph(glyphs[index]);
      return { value, label: label ?? fallback, glyph: node };
    });
  }
  return FACES.map(({ value }, index) => {
    const { node, label } = readGlyph(glyphs[index]);
    return {
      value,
      label: label ? `${label} (${value} of 5)` : `Rating ${value} of 5`,
      glyph: node,
    };
  });
}

export function FeedbackRating({
  variant,
  glyphs,
  className,
}: FeedbackRatingProps) {
  if (variant === "nps") return <NpsScale className={className} />;
  return (
    <GlyphRating variant={variant} glyphs={glyphs} className={className} />
  );
}

function GlyphRating({
  variant,
  glyphs,
  className,
}: Omit<FeedbackRatingProps, "variant"> & { variant: GlyphVariant }) {
  const { state, selectedValue, disabled, select, layout, showFollowUp } =
    useFeedbackContext();
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const [focusedValue, setFocusedValue] = React.useState<number | null>(null);
  const locked = disabled || state === "submitting" || state === "done";
  const stars = variant === "stars";
  const thumbs = variant === "thumbs";
  const inline = layout === "inline";
  const expected = EXPECTED_GLYPHS[variant];
  const validGlyphs = glyphs?.length === expected ? glyphs : undefined;

  React.useEffect(() => {
    if (glyphs && glyphs.length !== expected) {
      console.warn(
        `Sentimeter: ${variant} ratings take ${expected} glyph${expected === 1 ? "" : "s"}, received ${glyphs.length}. Using the built-in set.`,
      );
    }
  }, [expected, glyphs, variant]);

  const options = validGlyphs
    ? customChoices(variant, validGlyphs)
    : builtInChoices(variant);
  const previewValue = (!locked ? hoverValue : null) ?? selectedValue ?? 0;

  return (
    <div
      data-slot="feedback-rating"
      role="group"
      aria-label={
        stars ? "Star rating" : thumbs ? "Helpfulness" : "Experience rating"
      }
      className={cn(
        feedbackStyles.rating,
        thumbs && !inline && feedbackStyles.thumbsRating,
        inline && feedbackStyles.inlineRating,
        stars &&
          (inline
            ? feedbackStyles.inlineStarsRating
            : feedbackStyles.starsRating),
        className,
      )}
    >
      {options.map(({ value, label, glyph }) => {
        const selected = selectedValue === value;
        const filled = stars && value <= previewValue;
        // Without a note, the pick itself shows that it is sending.
        const sending = selected && state === "submitting" && !showFollowUp;

        return (
          <Button
            key={value}
            type="button"
            variant="ghost"
            disabled={locked}
            aria-pressed={selected}
            aria-label={label}
            title={label}
            tabIndex={
              value === (focusedValue ?? selectedValue ?? options[0]?.value)
                ? 0
                : -1
            }
            data-slot="feedback-choice"
            data-state={selected ? "selected" : "idle"}
            onMouseEnter={
              stars && !locked ? () => setHoverValue(value) : undefined
            }
            onMouseLeave={stars ? () => setHoverValue(null) : undefined}
            onFocus={() => {
              setFocusedValue(value);
              if (stars && !locked) setHoverValue(value);
            }}
            onBlur={stars ? () => setHoverValue(null) : undefined}
            onKeyDown={(event) => {
              if (!locked) moveFocus(event);
            }}
            onClick={() => select(value)}
            className={cn(
              feedbackStyles.choice,
              inline
                ? [feedbackStyles.inlineChoice, feedbackStyles.focus]
                : feedbackStyles.segment,
              thumbs && !inline && feedbackStyles.thumbChoice,
              !stars &&
                selected &&
                (inline
                  ? feedbackStyles.selected
                  : feedbackStyles.segmentSelected),
              filled && feedbackStyles.filledStar,
              (state === "done" || state === "submitting") &&
                selected &&
                feedbackStyles.submittedChoice,
            )}
          >
            {sending ? (
              <LoaderCircle
                aria-hidden="true"
                className={cn(
                  feedbackStyles.statusIcon,
                  "animate-spin text-current motion-reduce:animate-none",
                )}
              />
            ) : (
              <span
                aria-hidden="true"
                data-slot="feedback-glyph"
                className={cn(
                  feedbackStyles.glyph,
                  filled && feedbackStyles.filledGlyph,
                )}
              >
                {glyph}
              </span>
            )}
            {thumbs && !inline ? (
              <span aria-hidden="true" className={feedbackStyles.thumbLabel}>
                {label}
              </span>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}

function NpsScale({ className }: { className?: string }) {
  const {
    state,
    selectedValue,
    disabled,
    select,
    reset,
    resets,
    layout,
    showFollowUp,
  } = useFeedbackContext();
  // An answer belongs to the reset it was chosen after, so Cancel clears it.
  const [chosen, setChosen] = React.useState<{
    band: NpsBand;
    resets: number;
  } | null>(null);
  const chosenBand = chosen?.resets === resets ? chosen.band : null;
  const scoresRef = React.useRef<HTMLDivElement>(null);
  const focusScoresRef = React.useRef(false);
  const locked = disabled || state === "submitting" || state === "done";
  const inline = layout === "inline";
  const band =
    NPS_BANDS.find((candidate) =>
      (candidate.scores as readonly number[]).includes(selectedValue ?? -1),
    ) ?? chosenBand;

  React.useEffect(() => {
    if (!focusScoresRef.current) return;
    focusScoresRef.current = false;
    scoresRef.current
      ?.querySelector<HTMLButtonElement>('[data-slot="feedback-choice"]')
      ?.focus();
  }, [band]);

  const choiceClass = (selected: boolean) =>
    cn(
      feedbackStyles.choice,
      inline
        ? [feedbackStyles.inlineChoice, feedbackStyles.focus]
        : feedbackStyles.segment,
      (state === "done" || state === "submitting") &&
        selected &&
        feedbackStyles.submittedChoice,
    );

  return (
    <div
      data-slot="feedback-rating"
      className={cn(
        inline ? feedbackStyles.inlineNps : feedbackStyles.nps,
        className,
      )}
    >
      <div
        role="group"
        aria-label="How likely are you to recommend us?"
        className={
          inline ? feedbackStyles.inlineNpsRow : feedbackStyles.npsBands
        }
      >
        {NPS_BANDS.map((candidate, index) => {
          const selected = band === candidate;
          return (
            <Button
              key={candidate.label}
              type="button"
              variant="ghost"
              disabled={locked}
              aria-pressed={selected}
              tabIndex={(band ? selected : index === 0) ? 0 : -1}
              data-slot="feedback-choice"
              data-state={selected ? "selected" : "idle"}
              onKeyDown={(event) => {
                if (!locked) moveFocus(event);
              }}
              onClick={(event) => {
                if (locked || selected) return;
                focusScoresRef.current =
                  document.activeElement === event.currentTarget;
                // A new answer discards the score and note from the old one.
                const cleared =
                  selectedValue !== null && reset({ restoreFocus: false });
                setChosen({
                  band: candidate,
                  resets: cleared ? resets + 1 : resets,
                });
              }}
              className={cn(
                choiceClass(selected),
                inline ? feedbackStyles.inlineBand : feedbackStyles.npsBand,
                selected &&
                  (inline
                    ? feedbackStyles.selected
                    : feedbackStyles.segmentSelected),
              )}
            >
              {candidate.label}
            </Button>
          );
        })}
      </div>
      {band ? (
        <div
          ref={scoresRef}
          role="group"
          aria-label="Recommendation score"
          className={
            inline ? feedbackStyles.inlineNpsRow : feedbackStyles.npsScores
          }
          style={
            inline
              ? undefined
              : { gridTemplateColumns: `repeat(${band.scores.length}, 1fr)` }
          }
        >
          {band.scores.map((value, index) => {
            const selected = selectedValue === value;
            const sending = selected && state === "submitting" && !showFollowUp;
            return (
              <Button
                key={value}
                type="button"
                variant="ghost"
                disabled={locked}
                aria-pressed={selected}
                aria-label={`Score ${value} of 10`}
                title={`Score ${value} of 10`}
                tabIndex={
                  (selectedValue === null ? index === 0 : selected) ? 0 : -1
                }
                data-slot="feedback-choice"
                data-state={selected ? "selected" : "idle"}
                onKeyDown={(event) => {
                  if (!locked) moveFocus(event);
                }}
                onClick={() => select(value)}
                className={cn(
                  choiceClass(selected),
                  feedbackStyles.npsChoice,
                  selected && feedbackStyles.npsSelected,
                )}
              >
                {sending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className={cn(
                      feedbackStyles.statusIcon,
                      "animate-spin text-current motion-reduce:animate-none",
                    )}
                  />
                ) : (
                  value
                )}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
