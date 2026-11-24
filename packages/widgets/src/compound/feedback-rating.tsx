"use client";

import * as React from "react";
import {
  Angry,
  Frown,
  Laugh,
  LoaderCircle,
  Meh,
  Smile,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { feedbackStyles } from "../design-system";
import type { FeedbackGlyph } from "../types";
import { useFeedbackContext } from "./feedback-context";

type Choice = { value: number; label: string; glyph: React.ReactNode };

const FACES = [
  { value: 1, label: "Angry", emoji: "😖", Icon: Angry },
  { value: 2, label: "Sad", emoji: "😕", Icon: Frown },
  { value: 3, label: "Neutral", emoji: "😐", Icon: Meh },
  { value: 4, label: "Happy", emoji: "😊", Icon: Smile },
  { value: 5, label: "Delighted", emoji: "😍", Icon: Laugh },
] as const;

// Display order: the positive response first.
const THUMBS = [
  { value: 1, label: "Like", emoji: "👍", Icon: ThumbsUp },
  { value: 0, label: "Dislike", emoji: "👎", Icon: ThumbsDown },
] as const;

const EXPECTED_GLYPHS = { emoji: 5, thumbs: 2, stars: 1, nps: 0 } as const;

export type FeedbackRatingProps = {
  variant: "emoji" | "stars" | "thumbs" | "nps";
  /** Built-in faces: native emoji or Lucide icons. */
  emojiStyle?: "emoji" | "icons";
  /** Built-in thumbs or stars: Lucide icons or native emoji. */
  ratingStyle?: "icons" | "emoji";
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

function builtInChoices(
  variant: FeedbackRatingProps["variant"],
  useEmoji: boolean,
): Choice[] {
  if (variant === "nps") {
    return Array.from({ length: 11 }, (_, value) => ({
      value,
      label: `Score ${value} of 10`,
      glyph: value,
    }));
  }
  if (variant === "stars") {
    return FACES.map(({ value }) => ({
      value,
      label: `Rate ${value} star${value === 1 ? "" : "s"}`,
      glyph: useEmoji ? "⭐" : <Star aria-hidden="true" />,
    }));
  }
  const set = variant === "thumbs" ? THUMBS : FACES;
  return set.map(({ value, label, emoji, Icon }) => ({
    value,
    label:
      variant === "thumbs"
        ? label
        : useEmoji
          ? `Rating ${value} of 5`
          : `${label} (${value} of 5)`,
    glyph: useEmoji ? emoji : <Icon aria-hidden="true" />,
  }));
}

function customChoices(
  variant: FeedbackRatingProps["variant"],
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

// Arrow keys, Home, and End move focus within one row of choices.
function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>) {
  const choices = Array.from(
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
      ":scope > button",
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

const NPS_BANDS = [
  { id: "low", label: "Not likely", scores: [0, 1, 2, 3, 4, 5, 6] },
  { id: "mid", label: "Maybe", scores: [7, 8] },
  { id: "high", label: "Very likely", scores: [9, 10] },
] as const;

type NpsBand = (typeof NPS_BANDS)[number];

function bandOf(score: number | null) {
  if (score === null) return null;
  return NPS_BANDS.find((band) => band.scores.some((s) => s === score)) ?? null;
}

/**
 * Asks a plain question first, then refines it to that band's scores, so the
 * payload still carries a true 0-10 score.
 */
function NpsRefine({ className }: { className?: string }) {
  const { state, selectedValue, disabled, select, reset, showFollowUp } =
    useFeedbackContext();
  const [band, setBand] = React.useState<NpsBand | null>(null);
  const scoresRef = React.useRef<HTMLDivElement>(null);
  const focusScoresRef = React.useRef(false);
  const switchingBandRef = React.useRef(false);
  const locked = disabled || state === "submitting" || state === "done";
  const activeBand = band ?? bandOf(selectedValue);

  // Cancel clears the score, so it clears the band too.
  React.useEffect(() => {
    if (state !== "idle" || selectedValue !== null) return;
    if (switchingBandRef.current) switchingBandRef.current = false;
    else setBand(null);
  }, [state, selectedValue]);

  React.useEffect(() => {
    if (!focusScoresRef.current) return;
    focusScoresRef.current = false;
    scoresRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [band]);

  const choiceClass = cn(
    feedbackStyles.choice,
    feedbackStyles.focus,
    feedbackStyles.stackedChoice,
  );

  return (
    <div
      data-slot="feedback-rating"
      role="group"
      aria-label="Recommendation score"
      className={cn(feedbackStyles.npsRefine, className)}
    >
      <div
        role="group"
        aria-label="How likely"
        className={feedbackStyles.stackedRating}
      >
        {NPS_BANDS.map((option, index) => {
          const picked = activeBand?.id === option.id;
          return (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              disabled={locked}
              aria-expanded={picked}
              tabIndex={(activeBand ? picked : index === 0) ? 0 : -1}
              data-slot="feedback-band"
              data-state={picked ? "selected" : "idle"}
              onKeyDown={(event) => {
                if (!locked) moveFocus(event);
              }}
              onClick={() => {
                if (activeBand?.id === option.id) return;
                // A new band drops a score that no longer belongs to it.
                if (selectedValue !== null) {
                  switchingBandRef.current = true;
                  reset();
                }
                focusScoresRef.current = true;
                setBand(option);
              }}
              className={cn(
                choiceClass,
                feedbackStyles.bandChoice,
                picked && feedbackStyles.selected,
              )}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
      {activeBand ? (
        <div
          ref={scoresRef}
          role="group"
          aria-label={`${activeBand.label}: pick a score`}
          className={cn(feedbackStyles.stackedRating, feedbackStyles.npsScores)}
        >
          {activeBand.scores.map((score, index) => {
            const selected = selectedValue === score;
            const sendingHere =
              selected && state === "submitting" && !showFollowUp;
            return (
              <Button
                key={score}
                type="button"
                variant="ghost"
                disabled={locked}
                aria-pressed={selected}
                aria-label={`Score ${score} of 10`}
                title={`Score ${score} of 10`}
                tabIndex={
                  (
                    selectedValue !== null &&
                    activeBand.scores.some((s) => s === selectedValue)
                      ? selected
                      : index === 0
                  )
                    ? 0
                    : -1
                }
                data-slot="feedback-choice"
                data-state={selected ? "selected" : "idle"}
                onKeyDown={(event) => {
                  if (!locked) moveFocus(event);
                }}
                onClick={() => select(score)}
                className={cn(
                  choiceClass,
                  "text-sm tabular-nums",
                  selected && feedbackStyles.npsSelected,
                  (state === "done" || state === "submitting") &&
                    selected &&
                    feedbackStyles.submittedChoice,
                )}
              >
                {sendingHere ? (
                  <LoaderCircle
                    aria-hidden="true"
                    data-slot="feedback-choice-spinner"
                    className={cn(feedbackStyles.choiceSpinner, "text-current")}
                  />
                ) : (
                  score
                )}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function FeedbackRating({
  variant,
  emojiStyle = "emoji",
  ratingStyle = "icons",
  glyphs,
  className,
}: FeedbackRatingProps) {
  const { state, selectedValue, disabled, select, layout, showFollowUp } =
    useFeedbackContext();
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);
  const [focusedValue, setFocusedValue] = React.useState<number | null>(null);
  const locked = disabled || state === "submitting" || state === "done";
  const useEmoji = (variant === "emoji" ? emojiStyle : ratingStyle) === "emoji";
  const stars = variant === "stars";
  const thumbs = variant === "thumbs";
  const nps = variant === "nps";
  const inline = layout === "inline";
  const expected = EXPECTED_GLYPHS[variant];
  const validGlyphs = !nps && glyphs?.length === expected ? glyphs : undefined;

  React.useEffect(() => {
    if (glyphs && glyphs.length !== expected) {
      console.warn(
        `Sentimeter: ${variant} ratings take ${expected} glyph${expected === 1 ? "" : "s"}, received ${glyphs.length}. Using the built-in set.`,
      );
    }
  }, [expected, glyphs, variant]);

  if (nps && !inline) return <NpsRefine className={className} />;

  const options = validGlyphs
    ? customChoices(variant, validGlyphs)
    : builtInChoices(variant, useEmoji);
  const previewValue = (!locked ? hoverValue : null) ?? selectedValue ?? 0;

  return (
    <div
      data-slot="feedback-rating"
      role="group"
      aria-label={
        nps
          ? "Recommendation score"
          : stars
            ? "Star rating"
            : thumbs
              ? "Helpfulness"
              : "Experience rating"
      }
      className={cn(
        inline || nps ? feedbackStyles.rating : feedbackStyles.stackedRating,
        inline && feedbackStyles.inlineRating,
        stars &&
          (inline
            ? feedbackStyles.inlineStarsRating
            : feedbackStyles.starsRating),
        nps && feedbackStyles.npsRating,
        className,
      )}
    >
      {options.map(({ value, label, glyph }) => {
        const selected = selectedValue === value;
        const filled = stars && value <= previewValue;
        // A pick that sends at once shows its progress in place.
        const sendingHere = selected && state === "submitting" && !showFollowUp;

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
              feedbackStyles.focus,
              !inline && !nps && feedbackStyles.stackedChoice,
              thumbs && !inline && feedbackStyles.thumbChoice,
              inline && feedbackStyles.inlineChoice,
              nps && feedbackStyles.npsChoice,
              !stars && selected && feedbackStyles.selected,
              nps && selected && feedbackStyles.npsSelected,
              filled && feedbackStyles.filledStar,
              (state === "done" || state === "submitting") &&
                selected &&
                feedbackStyles.submittedChoice,
            )}
          >
            {sendingHere ? (
              <LoaderCircle
                aria-hidden="true"
                data-slot="feedback-choice-spinner"
                className={feedbackStyles.choiceSpinner}
              />
            ) : nps ? (
              glyph
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
      {nps ? (
        <div className={feedbackStyles.npsLegend}>
          <span>Not likely</span>
          <span>Very likely</span>
        </div>
      ) : null}
    </div>
  );
}
