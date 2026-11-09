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
  type ThumbGlyphs,
  type WidgetCallbacks,
  type WidgetLayout,
  type WidgetFollowUp,
  type RatingPayload,
  type WidgetSubmit,
  type WidgetSize,
  type FeedbackStyle,
} from "./feedback-system";

const DEFAULTS = {
  location: "/",
  title: "Was this helpful?",
  followUp: "negative",
  submitLabel: "Send",
  thankYouMessage: "Thanks!",
  thankYouDescription: "Your feedback helps us improve.",
  size: "default" as const,
} as const;

export type LikeDislikeProps = {
  location?: string;
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  title?: React.ReactNode;
  description?: React.ReactNode;
  followUp?: WidgetFollowUp;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  /** A quieter line under the thank-you in the stacked card. */
  thankYouDescription?: React.ReactNode;
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit<RatingPayload>;
  /** `stacked` (default) is the card; `inline` is a one-line bar. */
  layout?: WidgetLayout;
  /** Two custom glyphs: like, then dislike. Replaces the built-in thumbs. */
  glyphs?: ThumbGlyphs;
  /** Shows Cancel, which clears an unsent choice. Defaults to true. */
  showCancel?: boolean;
  cancelLabel?: string;
} & WidgetCallbacks<RatingPayload>;

export function LikeDislike({
  location = DEFAULTS.location,
  disabled,
  className,
  style,
  title = DEFAULTS.title,
  description,
  followUp = DEFAULTS.followUp,
  submitLabel,
  thankYouMessage = DEFAULTS.thankYouMessage,
  thankYouDescription = DEFAULTS.thankYouDescription,
  size = DEFAULTS.size,
  closeButton = false,
  submit,
  layout = "stacked",
  glyphs,
  showCancel = true,
  cancelLabel,
  ...callbacks
}: LikeDislikeProps) {
  const inline = layout === "inline";
  const rating = <FeedbackRating variant="thumbs" glyphs={glyphs} />;
  const footer = (
    <FeedbackFooter
      submitLabel={submitLabel ?? DEFAULTS.submitLabel}
      cancelLabel={cancelLabel}
      showCancel={showCancel}
      thankYouMessage={thankYouMessage}
      thankYouDescription={thankYouDescription}
      hint={inline ? "Optional" : undefined}
    />
  );

  return (
    <FeedbackWidget
      location={location}
      widgetType="thumbs"
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
          <FeedbackInput placeholder="What went wrong?" />
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
            <FeedbackInput placeholder="What went wrong?" />
          </FeedbackResponse>
          {footer}
        </>
      )}
    </FeedbackWidget>
  );
}
