"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cx } from "../core/ui";
import { useFeedbackContext } from "./feedback-context";
import type { WidgetSize } from "./feedback-context";

export type FeedbackFooterProps = {
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  thankYouMessage?: React.ReactNode;
  className?: string;
};

const FOOTER_BUTTON_SIZE_MAP: Record<WidgetSize, string> = {
  sm: "py-4",
  default: "py-5",
  md: "py-5",
  lg: "py-6",
};

export function FeedbackFooter({
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancel = false,
  thankYouMessage = "Thanks!",
  className,
}: FeedbackFooterProps) {
  const { state, disabled, submitSelected, cancel, text, size } =
    useFeedbackContext();

  if (state === "done") {
    return (
      <div
        className={cx(
          "mt-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground",
          className,
        )}
      >
        {thankYouMessage}
      </div>
    );
  }

  if (state !== "selected" && state !== "submitting") return null;

  return (
    <div className={cx("mt-5 flex gap-3", className)}>
      {showCancel ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || state === "submitting"}
          onClick={cancel}
          className={cx(
            "flex-1 rounded-2xl text-sm font-semibold",
            FOOTER_BUTTON_SIZE_MAP[size],
          )}
        >
          {cancelLabel}
        </Button>
      ) : null}
      <Button
        type="button"
        disabled={disabled || state === "submitting"}
        onClick={() => submitSelected(text)}
        className={cx(
          "flex-1 rounded-2xl text-sm font-semibold shadow-sm",
          FOOTER_BUTTON_SIZE_MAP[size],
        )}
      >
        {state === "submitting" ? "Submitting…" : submitLabel}
      </Button>
    </div>
  );
}
