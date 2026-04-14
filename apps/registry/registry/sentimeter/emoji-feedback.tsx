"use client";

import * as React from "react";
import {
  FeedbackDescription,
  FeedbackFooter,
  FeedbackInput,
  FeedbackRating,
  FeedbackTitle,
  FeedbackWidget,
  type WidgetCallbacks,
  type WidgetSubmit,
  type WidgetSize,
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
  title?: React.ReactNode;
  description?: React.ReactNode;
  showInput?: boolean;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  doneDurationMs?: number;
  variant?: "emoji" | "icons";
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit;
} & WidgetCallbacks;

export function EmojiFeedback({
  apiKey = DEFAULTS.apiKey,
  location = DEFAULTS.location,
  endpoint,
  disabled,
  className,
  title = DEFAULTS.title,
  description,
  showInput = DEFAULTS.showInput,
  submitLabel = DEFAULTS.submitLabel,
  thankYouMessage = DEFAULTS.thankYouMessage,
  doneDurationMs = 2000,
  variant = DEFAULTS.variant,
  size = DEFAULTS.size,
  closeButton = false,
  submit,
  ...callbacks
}: EmojiFeedbackProps) {
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
