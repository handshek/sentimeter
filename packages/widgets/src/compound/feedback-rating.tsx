"use client";

import * as React from "react";
import {
  IconMoodAngry,
  IconMoodAngryFilled,
  IconMoodSad,
  IconMoodSadFilled,
  IconMoodNeutral,
  IconMoodNeutralFilled,
  IconMoodSmile,
  IconMoodSmileFilled,
  IconMoodHappy,
  IconMoodHappyFilled,
  IconStar,
  IconStarFilled,
  IconThumbDown,
  IconThumbDownFilled,
  IconThumbUp,
  IconThumbUpFilled,
} from "@tabler/icons-react";
import { cx } from "../core/ui";
import { useFeedbackContext } from "./feedback-context";
import type { WidgetSize } from "./feedback-context";

/* ── Emoji data ─────────────────────────────────────────────── */

const DEFAULT_EMOJIS = ["😡", "🙁", "😐", "🙂", "😍"] as const;

const TABLER_SET = [
  { Outline: IconMoodAngry, Filled: IconMoodAngryFilled, label: "Angry" },
  { Outline: IconMoodSad, Filled: IconMoodSadFilled, label: "Sad" },
  {
    Outline: IconMoodNeutral,
    Filled: IconMoodNeutralFilled,
    label: "Neutral",
  },
  { Outline: IconMoodSmile, Filled: IconMoodSmileFilled, label: "Happy" },
  { Outline: IconMoodHappy, Filled: IconMoodHappyFilled, label: "Delighted" },
] as const;

/* ── Size map ───────────────────────────────────────────────── */

const SIZE_MAP: Record<
  WidgetSize,
  { iconSize: number; btnClass: string; emojiClass: string }
> = {
  sm: { iconSize: 18, btnClass: "h-8 w-8", emojiClass: "h-8 w-8 text-lg" },
  default: {
    iconSize: 24,
    btnClass: "h-10 w-10",
    emojiClass: "h-10 w-10 text-2xl",
  },
  md: { iconSize: 28, btnClass: "h-12 w-12", emojiClass: "h-12 w-12 text-3xl" },
  lg: { iconSize: 32, btnClass: "h-14 w-14", emojiClass: "h-14 w-14 text-4xl" },
};

/* ── Props ──────────────────────────────────────────────────── */

export type FeedbackRatingProps = {
  variant: "emoji" | "stars" | "thumbs";
  /** Only applies when variant is "emoji" */
  emojiStyle?: "emoji" | "tabler";
  className?: string;
};

/* ── Component ──────────────────────────────────────────────── */

export function FeedbackRating({
  variant,
  emojiStyle = "emoji",
  className,
}: FeedbackRatingProps) {
  const { state, selectedValue, disabled, select, size } = useFeedbackContext();
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const isLocked = disabled || state === "submitting";
  const { iconSize, btnClass, emojiClass } = SIZE_MAP[size];
  const wrapperClass =
    "mt-4 w-full flex items-center justify-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3";

  /* ── Thumbs — icon-only, horizontal ────────────────────── */
  if (variant === "thumbs") {
    const options = [
      {
        value: 1,
        label: "Like",
        Outline: IconThumbUp,
        Filled: IconThumbUpFilled,
      },
      {
        value: 0,
        label: "Dislike",
        Outline: IconThumbDown,
        Filled: IconThumbDownFilled,
      },
    ] as const;

    return (
      <div
        className={cx(
          wrapperClass,
          className,
        )}
      >
        {options.map(({ value, label, Outline, Filled }) => {
          const selected = selectedValue === value;
          const Icon = selected ? Filled : Outline;
          return (
            <button
              key={label}
              type="button"
              disabled={isLocked}
              onClick={() => select(value)}
              className={cx(
                "relative flex shrink-0 aspect-square items-center justify-center rounded-full transition-all duration-200",
                btnClass,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                selected
                  ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
              aria-pressed={selected ? "true" : "false"}
              aria-label={label}
              title={label}
            >
              <Icon size={iconSize} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Stars ──────────────────────────────────────────────── */
  if (variant === "stars") {
    const previewValue = hoverValue ?? selectedValue ?? 0;
    return (
      <div
        className={cx(
          wrapperClass,
          className,
        )}
      >
        {Array.from({ length: 5 }).map((_, idx) => {
          const value = idx + 1;
          const filled = value <= previewValue;
          const selected = selectedValue === value;
          const label = `Rate ${value} star${value === 1 ? "" : "s"}`;
          const Icon = filled ? IconStarFilled : IconStar;
          return (
            <button
              key={value}
              type="button"
              disabled={isLocked}
              onMouseEnter={() => setHoverValue(value)}
              onMouseLeave={() => setHoverValue(null)}
              onFocus={() => setHoverValue(value)}
              onBlur={() => setHoverValue(null)}
              onClick={() => select(value)}
              className={cx(
                "relative flex shrink-0 aspect-square items-center justify-center rounded-full transition-all duration-200",
                btnClass,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                selected
                  ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                  : filled
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
              aria-pressed={selected ? "true" : "false"}
              aria-label={label}
              title={label}
            >
              <Icon size={iconSize} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Emoji (default) ───────────────────────────────────── */
  return (
    <div
      className={cx(
        wrapperClass,
        className,
      )}
    >
      {emojiStyle === "emoji"
        ? DEFAULT_EMOJIS.map((emoji, idx) => {
            const value = idx + 1;
            const selected = selectedValue === value;
            const label = `Rating ${value} of 5`;
            return (
              <button
                key={emoji}
                type="button"
                disabled={isLocked}
                onClick={() => select(value)}
                className={cx(
                  "relative flex shrink-0 aspect-square items-center justify-center rounded-full transition-all duration-200",
                  emojiClass,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  selected
                    ? "bg-primary/10 ring-2 ring-primary/20"
                    : "hover:bg-muted/50",
                  isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
                aria-pressed={selected ? "true" : "false"}
                aria-label={label}
                title={label}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            );
          })
        : TABLER_SET.map(({ Outline, Filled, label }, idx) => {
            const value = idx + 1;
            const selected = selectedValue === value;
            const Icon = selected ? Filled : Outline;
            const aria = `${label} (${value} of 5)`;
            return (
              <button
                key={label}
                type="button"
                disabled={isLocked}
                onClick={() => select(value)}
                className={cx(
                  "relative flex shrink-0 aspect-square items-center justify-center rounded-full transition-all duration-200",
                  btnClass,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  selected
                    ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
                aria-pressed={selected ? "true" : "false"}
                aria-label={aria}
                title={aria}
              >
                <Icon size={iconSize} aria-hidden="true" />
              </button>
            );
          })}
    </div>
  );
}
