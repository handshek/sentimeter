"use client";

import * as React from "react";
import {
  Angry,
  Frown,
  Laugh,
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

export function FeedbackRating({
  variant,
  emojiStyle = "emoji",
  ratingStyle = "icons",
  glyphs,
  className,
}: FeedbackRatingProps) {
  const { state, selectedValue, disabled, select, layout } =
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
        feedbackStyles.rating,
        thumbs && !inline && feedbackStyles.thumbsRating,
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
              if (locked) return;
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
            }}
            onClick={() => select(value)}
            className={cn(
              feedbackStyles.choice,
              feedbackStyles.focus,
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
            {nps ? (
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
