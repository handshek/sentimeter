"use client";

import * as React from "react";
import type { WidgetCallbacks, WidgetSubmit } from "./types";
import { submitFeedback } from "./core/submit";
import {
  FeedbackWidget,
  FeedbackTitle,
  FeedbackDescription,
  FeedbackRating,
  FeedbackInput,
  FeedbackFooter,
  type WidgetSize,
} from "./compound";

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
