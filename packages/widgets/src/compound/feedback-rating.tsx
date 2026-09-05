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
import { cn } from "@workspace/ui/lib/utils";
import { useFeedbackContext } from "./feedback-context";
import type { WidgetSize } from "./feedback-context";

/* ── Emoji data ─────────────────────────────────────────────── */

const DEFAULT_EMOJIS = ["😖", "😕", "😐", "😊", "😍"] as const;

const THUMB_OPTIONS = [
  { value: 0, label: "Dislike", emoji: "👎", Icon: ThumbsDown },
  { value: 1, label: "Like", emoji: "👍", Icon: ThumbsUp },
] as const;

const LUCIDE_FACE_SET = [
  { Icon: Angry, label: "Angry" },
  { Icon: Frown, label: "Sad" },
  { Icon: Meh, label: "Neutral" },
  { Icon: Smile, label: "Happy" },
  { Icon: Laugh, label: "Delighted" },
] as const;

/* ── Size map ───────────────────────────────────────────────── */

const SIZE_MAP: Record<
  WidgetSize,
  { iconClass: string; btnClass: string; emojiClass: string }
> = {
  sm: {
    iconClass: "size-[18px]",
    btnClass: "size-[44px]",
    emojiClass: "size-[44px] text-lg",
  },
  default: {
    iconClass: "size-6",
    btnClass: "size-[44px]",
    emojiClass: "size-[44px] text-2xl",
  },
  md: {
    iconClass: "size-6 @[320px]:size-7",
    btnClass: "size-[44px] @[320px]:size-12",
    emojiClass: "size-[44px] text-2xl @[320px]:size-12 @[320px]:text-3xl",
  },
  lg: {
    iconClass: "size-6 @[360px]:size-8",
    btnClass: "size-[44px] @[360px]:size-14",
    emojiClass: "size-[44px] text-2xl @[360px]:size-14 @[360px]:text-4xl",
  },
};

/* ── Props ──────────────────────────────────────────────────── */

export type FeedbackRatingProps = {
  variant: "emoji" | "stars" | "thumbs";
  /** Only applies when variant is "emoji" (5-point mood scale) */
  emojiStyle?: "emoji" | "icons";
  /**
   * Thumbs: Lucide vs Unicode 👎/👍. Stars: Lucide vs ⭐ row (grayscale until preview).
   * @default "icons"
   */
  ratingStyle?: "icons" | "emoji";
  className?: string;
};

/* ── Component ──────────────────────────────────────────────── */

export function FeedbackRating({
  variant,
  emojiStyle = "emoji",
  ratingStyle = "icons",
  className,
}: FeedbackRatingProps) {
  const { state, selectedValue, disabled, select, size } = useFeedbackContext();
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const isLocked = disabled || state === "submitting";
  const { iconClass, btnClass, emojiClass } = SIZE_MAP[size];
  const wrapperClass = cn(
    "mt-4 w-full items-center justify-center rounded-2xl border border-border/60 bg-muted/20",
    variant === "thumbs"
      ? "flex gap-2 p-2 @[320px]:gap-3 @[320px]:p-3"
      : "grid grid-cols-5 place-items-center gap-px p-1 @[320px]:gap-2 @[320px]:p-2 @[360px]:gap-3 @[360px]:p-3",
  );

  /* ── Thumbs ─────────────────────────────────────────────── */
  if (variant === "thumbs") {
    if (ratingStyle === "emoji") {
      return (
        <div className={cn(wrapperClass, className)}>
          {THUMB_OPTIONS.map(({ value, label, emoji }) => {
            const selected = selectedValue === value;
            return (
              <button
                key={value}
                type="button"
                disabled={isLocked}
                onClick={() => select(value)}
                className={cn(
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
          })}
        </div>
      );
    }

    return (
      <div className={cn(wrapperClass, className)}>
        {[...THUMB_OPTIONS].reverse().map(({ value, label, Icon }) => {
          const selected = selectedValue === value;
          return (
            <button
              key={label}
              type="button"
              disabled={isLocked}
              onClick={() => select(value)}
              className={cn(
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
              <Icon
                strokeWidth={selected ? 2.5 : 2}
                className={cn(iconClass, selected ? "text-primary" : undefined)}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Stars ──────────────────────────────────────────────── */
  if (variant === "stars") {
    const previewValue = hoverValue ?? selectedValue ?? 0;

    if (ratingStyle === "emoji") {
      return (
        <div className={cn(wrapperClass, className)}>
          {Array.from({ length: 5 }).map((_, idx) => {
            const value = idx + 1;
            const filled = value <= previewValue;
            const selected = selectedValue === value;
            const label = `Rate ${value} star${value === 1 ? "" : "s"}`;
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
                className={cn(
                  "relative flex shrink-0 aspect-square items-center justify-center rounded-full transition-all duration-200",
                  emojiClass,
                  "font-normal leading-none",
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
                <span
                  aria-hidden="true"
                  className={cn(
                    "select-none transition-[filter,color] duration-200",
                    filled
                      ? "text-primary grayscale-0"
                      : "text-muted-foreground/65 grayscale",
                  )}
                >
                  ⭐
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className={cn(wrapperClass, className)}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const value = idx + 1;
          const filled = value <= previewValue;
          const selected = selectedValue === value;
          const label = `Rate ${value} star${value === 1 ? "" : "s"}`;
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
              className={cn(
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
              <Star
                className={iconClass}
                fill={filled ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Emoji (default) — 5-point mood ───────────────────────── */
  return (
    <div className={cn(wrapperClass, className)}>
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
                className={cn(
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
        : LUCIDE_FACE_SET.map(({ Icon, label }, idx) => {
            const value = idx + 1;
            const selected = selectedValue === value;
            const aria = `${label} (${value} of 5)`;
            return (
              <button
                key={label}
                type="button"
                disabled={isLocked}
                onClick={() => select(value)}
                className={cn(
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
                <Icon
                  className={cn(
                    iconClass,
                    selected ? "text-primary" : undefined,
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
    </div>
  );
}
