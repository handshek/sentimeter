"use client";

import * as React from "react";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { useFeedbackContext } from "./feedback-context";
import { feedbackStyles } from "../design-system";

export type FeedbackInputProps = {
  /** Hint after a negative pick. */
  placeholder?: string;
  /** Hint after any other pick, when `followUp` asks for a note there too. */
  positivePlaceholder?: string;
  /** Accessible name for the text field. */
  label?: string;
  /** Maximum comment length. Defaults to 500 characters. */
  maxLength?: number;
  className?: string;
};

export const FEEDBACK_TEXT_MAX_LENGTH = 500;

export function FeedbackInput({
  placeholder = "Share your thoughts",
  positivePlaceholder = "Tell us more",
  label = "Additional feedback",
  maxLength = FEEDBACK_TEXT_MAX_LENGTH,
  className,
}: FeedbackInputProps) {
  const { state, disabled, text, setText, showFollowUp, negativePick, layout } =
    useFeedbackContext();
  const inputId = React.useId();

  if (!showFollowUp || state === "done") return null;

  return (
    <div
      data-slot="feedback-field"
      className={cn(
        feedbackStyles.field,
        layout === "inline" && feedbackStyles.inlineField,
        className,
      )}
    >
      <Label htmlFor={inputId} className={feedbackStyles.label}>
        {label} (optional)
      </Label>
      <Textarea
        id={inputId}
        className={cn(
          feedbackStyles.input,
          layout === "inline" && feedbackStyles.inlineInput,
        )}
        rows={4}
        aria-label={label}
        placeholder={negativePick ? placeholder : positivePlaceholder}
        maxLength={maxLength}
        value={text}
        onChange={(e) => {
          if (!disabled && state !== "submitting") setText(e.target.value);
        }}
        disabled={disabled || state === "submitting"}
      />
    </div>
  );
}
