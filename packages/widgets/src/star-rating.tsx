"use client";

import * as React from "react";
import type { WidgetCallbacks, WidgetSubmit } from "./types";
import { DEFAULT_FEEDBACK_ENDPOINT } from "./core/submit";
import {
  FeedbackWidget,
  FeedbackTitle,
  FeedbackDescription,
  FeedbackRating,
  FeedbackInput,
  FeedbackFooter,
  type WidgetSize,
} from "./compound";

const DEFAULTS = {
  apiKey: "",
  location: "/",
  title: "Rate your experience",
  showInput: false,
  submitLabel: "Submit",
  thankYouMessage: "Thanks!",
  variant: "icons" as const,
  size: "default" as const,
} as const;

export type StarRatingProps = {
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
  /** Lucide stars vs ⭐ emoji row, grayscale until included in preview (same hover behavior) */
  variant?: "icons" | "emoji";
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit;
} & WidgetCallbacks;

export function StarRating({
  apiKey = DEFAULTS.apiKey,
  location = DEFAULTS.location,
  endpoint = DEFAULT_FEEDBACK_ENDPOINT,
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
}: StarRatingProps) {
  return (
    <FeedbackWidget
      apiKey={apiKey}
      location={location}
      endpoint={endpoint}
      widgetType="star"
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
      <FeedbackRating variant="stars" ratingStyle={variant} />
      {showInput ? <FeedbackInput /> : null}
      <FeedbackFooter
        submitLabel={submitLabel}
        thankYouMessage={thankYouMessage}
      />
    </FeedbackWidget>
  );
}
