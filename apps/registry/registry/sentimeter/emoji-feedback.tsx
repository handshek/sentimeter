"use client";

import * as React from "react";
import {
  FeedbackDescription,
  FeedbackFooter,
  FeedbackInput,
  FeedbackRating,
  FeedbackTitle,
  FeedbackWidget,
  submitFeedback,
  type WidgetCallbacks,
  type WidgetSubmit,
  type WidgetSize,
} from "./feedback-system";

export type EmojiFeedbackProps = {
  apiKey: string;
  location: string;
  disabled?: boolean;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  showInput?: boolean;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  doneDurationMs?: number;
  variant?: "emoji" | "tabler";
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit;
} & WidgetCallbacks;

export function EmojiFeedback({
  apiKey,
  location,
  disabled,
  className,
  title = "Rate your experience",
  description,
  showInput = false,
  submitLabel = "Submit",
  thankYouMessage = "Thanks!",
  doneDurationMs = 2000,
  variant = "emoji",
  size = "default",
  closeButton = false,
  submit = submitFeedback,
  ...callbacks
}: EmojiFeedbackProps) {
  return (
    <FeedbackWidget
      apiKey={apiKey}
      location={location}
      widgetType="emoji"
      disabled={disabled}
      size={size}
      closeButton={closeButton}
      className={className}
      doneDurationMs={doneDurationMs}
      submit={submit}
      {...callbacks}
    >
      <div className="space-y-1">
        {title ? <FeedbackTitle>{title}</FeedbackTitle> : null}
        {description ? (
          <FeedbackDescription>{description}</FeedbackDescription>
        ) : null}
      </div>
      <FeedbackRating variant="emoji" emojiStyle={variant} />
      {showInput ? <FeedbackInput /> : null}
      <FeedbackFooter
        submitLabel={submitLabel}
        thankYouMessage={thankYouMessage}
      />
    </FeedbackWidget>
  );
}
