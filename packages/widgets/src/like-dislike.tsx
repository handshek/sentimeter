"use client";

import * as React from "react";
import type { WidgetCallbacks, WidgetSubmit } from "./types";
import {
  FeedbackWidget,
  FeedbackTitle,
  FeedbackDescription,
  FeedbackRating,
  FeedbackInput,
  FeedbackFooter,
  type WidgetSize,
} from "./compound";

const DEFAULT_ENDPOINT = "https://coordinated-perch-697.convex.site/feedback";

const DEFAULTS = {
  apiKey: "",
  location: "/",
  title: "Was this helpful?",
  showInput: false,
  submitLabel: "Submit",
  thankYouMessage: "Thanks!",
  size: "default" as const,
} as const;

export type LikeDislikeProps = {
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
  size?: WidgetSize;
  closeButton?: boolean;
  submit?: WidgetSubmit;
} & WidgetCallbacks;

export function LikeDislike({
  apiKey = DEFAULTS.apiKey,
  location = DEFAULTS.location,
  endpoint = DEFAULT_ENDPOINT,
  disabled,
  className,
  title = DEFAULTS.title,
  description,
  showInput = DEFAULTS.showInput,
  submitLabel = DEFAULTS.submitLabel,
  thankYouMessage = DEFAULTS.thankYouMessage,
  doneDurationMs = 2000,
  size = DEFAULTS.size,
  closeButton = false,
  submit,
  ...callbacks
}: LikeDislikeProps) {
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
      <FeedbackRating variant="thumbs" />
      {showInput ? <FeedbackInput /> : null}
      <FeedbackFooter
        submitLabel={submitLabel}
        thankYouMessage={thankYouMessage}
      />
    </FeedbackWidget>
  );
}
