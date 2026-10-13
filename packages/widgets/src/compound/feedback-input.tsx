"use client";

import * as React from "react";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { cn } from "@workspace/ui/lib/utils";
import { useFeedbackContext } from "./feedback-context";
import { feedbackStyles } from "../design-system";

export type FeedbackInputProps = {
  placeholder?: string;
  /** Accessible name for the text field. */
  label?: string;
  /** Maximum comment length. Defaults to 500 characters. */
  maxLength?: number;
  className?: string;
};

export const FEEDBACK_TEXT_MAX_LENGTH = 500;

export function FeedbackInput({
  placeholder = "Share your thoughts",
  label = "Additional feedback",
  maxLength = FEEDBACK_TEXT_MAX_LENGTH,
  className,
}: FeedbackInputProps) {
  const { state, disabled, text, setText, selectedValue, layout } =
    useFeedbackContext();
  const inputId = React.useId();

  if (selectedValue === null) return null;

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
        placeholder={placeholder}
        maxLength={maxLength}
        value={text}
        onChange={(e) => {
          if (!disabled && state !== "submitting" && state !== "done")
            setText(e.target.value);
        }}
        readOnly={state === "done"}
        disabled={disabled || state === "submitting" || state === "done"}
      />
    </div>
  );
}
