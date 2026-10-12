"use client";

import * as React from "react";
import {
  DEFAULT_FEEDBACK_ENDPOINT,
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
  type WidgetSubmit,
  type WidgetSize,
  type FeedbackStyle,
} from "./feedback-system";

const DEFAULTS = {
  apiKey: "",
  location: "/",
  title: "Was this helpful?",
  showInput: false,
  submitLabel: "Submit",
  thankYouMessage: "Thanks!",
  variant: "icons" as const,
  size: "default" as const,
} as const;

export type LikeDislikeProps = {
  apiKey?: string;
  location?: string;
  endpoint?: string;
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  title?: React.ReactNode;
  description?: React.ReactNode;
  showInput?: boolean;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  doneDurationMs?: number;
  autoHide?: boolean;
  /** Lucide thumbs vs Unicode 👎 / 👍 */
  variant?: "icons" | "emoji";
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit;
  /** `stacked` (default) is the card; `inline` is a one-line bar. */
  layout?: WidgetLayout;
  /** Two custom glyphs: like, then dislike. Replaces `variant`. */
  glyphs?: ThumbGlyphs;
  /** Shows Cancel, which clears an unsent choice. Defaults to true. */
  showCancel?: boolean;
  cancelLabel?: string;
} & WidgetCallbacks;

export function LikeDislike({
  apiKey = DEFAULTS.apiKey,
  location = DEFAULTS.location,
  endpoint = DEFAULT_FEEDBACK_ENDPOINT,
  disabled,
  className,
  style,
  title = DEFAULTS.title,
  description,
  showInput = DEFAULTS.showInput,
  submitLabel,
  thankYouMessage = DEFAULTS.thankYouMessage,
  doneDurationMs = 2000,
  autoHide = true,
  variant = DEFAULTS.variant,
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
  const rating = (
    <FeedbackRating variant="thumbs" ratingStyle={variant} glyphs={glyphs} />
  );
  const footer = (
    <FeedbackFooter
      submitLabel={submitLabel ?? (inline ? "Send" : DEFAULTS.submitLabel)}
      cancelLabel={cancelLabel}
      showCancel={showCancel}
      thankYouMessage={thankYouMessage}
      hint={inline && showInput ? "Optional" : undefined}
    />
  );

  return (
    <FeedbackWidget
      apiKey={apiKey}
      location={location}
      endpoint={endpoint}
      widgetType="thumbs"
      disabled={disabled}
      size={size}
      closeButton={closeButton}
      className={className}
      style={style}
      doneDurationMs={doneDurationMs}
      autoHide={autoHide}
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
          {showInput ? <FeedbackInput /> : null}
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
            {showInput ? <FeedbackInput /> : null}
          </FeedbackResponse>
          {footer}
        </>
      )}
    </FeedbackWidget>
  );
}
