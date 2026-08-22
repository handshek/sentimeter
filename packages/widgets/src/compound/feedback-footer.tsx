"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useFeedbackContext } from "./feedback-context";
import type { WidgetSize } from "./feedback-context";
import { LoaderCircle } from "lucide-react";

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
  const {
    state,
    submitError,
    disabled,
    submitSelected,
    cancel,
    text,
    size,
    containerRef,
  } = useFeedbackContext();
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const successRef = React.useRef<HTMLDivElement>(null);
  const shouldFocusSuccessRef = React.useRef(false);

  React.useEffect(() => {
    const activeElement = document.activeElement;
    const focusMovedOutside =
      activeElement !== document.body &&
      activeElement !== null &&
      !containerRef.current?.contains(activeElement);

    if (
      state === "done" &&
      shouldFocusSuccessRef.current &&
      !focusMovedOutside
    ) {
      successRef.current?.focus();
    }
  }, [containerRef, state]);

  if (state === "done") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
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
    <div className={cn("mt-5", className)}>
      {state === "submitting" ? (
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          Submitting feedback
        </p>
      ) : null}
      {submitError ? (
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mb-3 text-sm text-destructive"
        >
          {submitError.message}
        </p>
      ) : null}
      <div className="flex gap-3">
        {showCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled || state === "submitting"}
            onClick={cancel}
            className={cn(
              "flex-1 rounded-2xl text-sm font-semibold",
              FOOTER_BUTTON_SIZE_MAP[size],
            )}
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          ref={submitButtonRef}
          type="button"
          disabled={disabled || state === "submitting"}
          onClick={() => {
            shouldFocusSuccessRef.current =
              document.activeElement === submitButtonRef.current;
            void submitSelected(text);
          }}
          onBlur={(event) => {
            if (event.relatedTarget) shouldFocusSuccessRef.current = false;
          }}
          className={cn(
            "flex-1 rounded-2xl text-sm font-semibold shadow-sm",
            FOOTER_BUTTON_SIZE_MAP[size],
          )}
        >
          {state === "submitting" ? (
            <>
              <LoaderCircle
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Submitting…
            </>
          ) : submitError ? (
            "Try Again"
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}
