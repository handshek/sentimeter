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
  title: "How likely are you to recommend us?",
  followUp: "negative",
  submitLabel: "Send",
  thankYouMessage: "Thanks!",
  size: "default" as const,
} as const;

export type NpsScoreProps = {
  location?: string;
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  title?: React.ReactNode;
  description?: React.ReactNode;
  followUp?: WidgetFollowUp;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit<RatingPayload>;
  /** `stacked` (default) is the card; `inline` is a one-line bar. */
  layout?: WidgetLayout;
  /** Shows Cancel, which clears an unsent choice. Defaults to true. */
  showCancel?: boolean;
  cancelLabel?: string;
} & WidgetCallbacks<RatingPayload>;

export function NpsScore({
  location = DEFAULTS.location,
  disabled,
  className,
  style,
  title = DEFAULTS.title,
  description,
  followUp = DEFAULTS.followUp,
  submitLabel,
  thankYouMessage = DEFAULTS.thankYouMessage,
  size = DEFAULTS.size,
  closeButton = false,
  submit,
  layout = "stacked",
  showCancel = true,
  cancelLabel,
  ...callbacks
}: NpsScoreProps) {
  const inline = layout === "inline";
  const rating = <FeedbackRating variant="nps" />;
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
      widgetType="nps"
      disabled={disabled}
      size={size}
      closeButton={closeButton}
      className={inline ? `w-full ${className ?? ""}` : className}
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
          <FeedbackInput placeholder="What would make it better? (optional)" />
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
            <FeedbackInput placeholder="What would make it better? (optional)" />
          </FeedbackResponse>
          {footer}
        </>
      )}
    </FeedbackWidget>
  );
}
