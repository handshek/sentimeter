"use client";

import * as React from "react";
import {
  feedbackStyles,
  FeedbackWidget,
  FeedbackTitle,
  FeedbackDescription,
  FeedbackRating,
  FeedbackResponse,
  FeedbackInput,
  FeedbackFooter,
  type FeedbackGlyph,
  type WidgetCallbacks,
  type WidgetLayout,
  type WidgetFollowUp,
  type WidgetSubmit,
  type WidgetSize,
  type FeedbackStyle,
} from "./feedback-system";

const DEFAULTS = {
  location: "/",
  title: "Rate your experience",
  followUp: "negative",
  submitLabel: "Send",
  thankYouMessage: "Thanks!",
  variant: "icons" as const,
  size: "default" as const,
} as const;

export type StarRatingProps = {
  location?: string;
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  title?: React.ReactNode;
  description?: React.ReactNode;
  followUp?: WidgetFollowUp;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  /** Lucide stars vs ⭐ emoji row, grayscale until included in preview (same hover behavior) */
  variant?: "icons" | "emoji";
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit;
  /** `stacked` (default) is the card; `inline` is a one-line bar. */
  layout?: WidgetLayout;
  /** One custom glyph, repeated five times. Replaces `variant`. */
  glyph?: FeedbackGlyph;
  /** Shows Cancel, which clears an unsent choice. Defaults to true. */
  showCancel?: boolean;
  cancelLabel?: string;
} & WidgetCallbacks;

export function StarRating({
  location = DEFAULTS.location,
  disabled,
  className,
  style,
  title = DEFAULTS.title,
  description,
  followUp = DEFAULTS.followUp,
  submitLabel,
  thankYouMessage = DEFAULTS.thankYouMessage,
  variant = DEFAULTS.variant,
  size = DEFAULTS.size,
  closeButton = false,
  submit,
  layout = "stacked",
  glyph,
  showCancel = true,
  cancelLabel,
  ...callbacks
}: StarRatingProps) {
  const inline = layout === "inline";
  const rating = (
    <FeedbackRating
      variant="stars"
      ratingStyle={variant}
      glyphs={glyph === undefined ? undefined : [glyph]}
    />
  );
  const footer = (
    <FeedbackFooter
      submitLabel={submitLabel ?? DEFAULTS.submitLabel}
      cancelLabel={cancelLabel}
      showCancel={showCancel}
      thankYouMessage={thankYouMessage}
      hint={inline ? "Optional" : undefined}
    />
  );

  return (
    <FeedbackWidget
      location={location}
      widgetType="star"
      disabled={disabled}
      size={size}
      closeButton={closeButton}
      className={className}
      style={style}
      followUp={followUp}
      submit={submit}
      layout={layout}
      {...callbacks}
    >
      {inline ? (
        <>
          <div data-slot="feedback-bar" className={feedbackStyles.bar}>
            {title ? <FeedbackTitle>{title}</FeedbackTitle> : null}
            {rating}
          </div>
          <FeedbackInput placeholder="What went wrong? (optional)" />
          {footer}
        </>
      ) : (
        <>
          {title || description ? (
            <div data-slot="feedback-header" className={feedbackStyles.header}>
              {title ? <FeedbackTitle>{title}</FeedbackTitle> : null}
              {description ? (
                <FeedbackDescription>{description}</FeedbackDescription>
              ) : null}
            </div>
          ) : null}
          <FeedbackResponse>
            {rating}
            <FeedbackInput placeholder="What went wrong? (optional)" />
          </FeedbackResponse>
          {footer}
        </>
      )}
    </FeedbackWidget>
  );
}
