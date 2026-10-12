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
  type FaceGlyphs,
  type WidgetCallbacks,
  type WidgetLayout,
  type WidgetSubmit,
  type WidgetSize,
  type FeedbackStyle,
} from "./feedback-system";

const DEFAULTS = {
  apiKey: "",
  location: "/",
  title: "Rate your experience",
  showInput: false,
  submitLabel: "Submit",
  thankYouMessage: "Thanks!",
  variant: "emoji" as const,
  size: "default" as const,
} as const;

export type EmojiFeedbackProps = {
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
  variant?: "emoji" | "icons";
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit;
  /** `stacked` (default) is the card; `inline` is a one-line bar. */
  layout?: WidgetLayout;
  /** Five custom glyphs, worst to best. Replaces `variant`. */
  glyphs?: FaceGlyphs;
  /** Shows Cancel, which clears an unsent choice. Defaults to true. */
  showCancel?: boolean;
  cancelLabel?: string;
} & WidgetCallbacks;

export function EmojiFeedback({
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
}: EmojiFeedbackProps) {
  const inline = layout === "inline";
  const rating = (
    <FeedbackRating variant="emoji" emojiStyle={variant} glyphs={glyphs} />
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
      widgetType="emoji"
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
