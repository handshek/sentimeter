"use client";

import * as React from "react";
import { Textarea } from "@workspace/ui/components/textarea";
import { cx } from "../core/ui";
import { useFeedbackContext } from "./feedback-context";
import type { WidgetSize } from "./feedback-context";

export type FeedbackInputProps = {
  placeholder?: string;
  className?: string;
};

const TEXTAREA_SIZE_MAP: Record<WidgetSize, string> = {
  sm: "min-h-[110px] px-3 py-2.5",
  default: "min-h-[120px] px-4 py-3",
  md: "min-h-[132px] px-4 py-3.5",
  lg: "min-h-[144px] px-5 py-4",
};

export function FeedbackInput({
  placeholder = "Share your thoughts",
  className,
}: FeedbackInputProps) {
  const { state, disabled, text, setText, size, selectedValue } =
    useFeedbackContext();

  if (selectedValue === null) return null;

  return (
    <div className={cx("mt-4", className)}>
      <Textarea
        className={cx(
          "w-full resize-none rounded-2xl border border-border/60 bg-muted/15 leading-relaxed",
          TEXTAREA_SIZE_MAP[size],
        )}
        rows={4}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || state === "submitting"}
      />
    </div>
  );
}
