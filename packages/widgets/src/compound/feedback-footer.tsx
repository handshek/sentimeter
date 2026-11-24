"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useFeedbackContext } from "./feedback-context";
import { Check, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { feedbackStyles } from "../design-system";

export type FeedbackFooterProps = {
  submitLabel?: string;
  /** Clears the unsent choice and comment. */
  cancelLabel?: string;
  showCancel?: boolean;
  thankYouMessage?: React.ReactNode;
  /** A muted second line under the stacked thank-you. */
  thankYouDescription?: React.ReactNode;
  /** A short note at the start of the inline footer. */
  hint?: React.ReactNode;
  className?: string;
};

export function FeedbackFooter({
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancel = true,
  thankYouMessage = "Thanks!",
  thankYouDescription = "Your feedback helps us improve.",
  hint,
  className,
}: FeedbackFooterProps) {
  const {
    state,
    submitError,
    disabled,
    submitSelected,
    reset,
    text,
    containerRef,
    selectionHadFocusRef,
    layout,
    showFollowUp,
  } = useFeedbackContext();
  const inline = layout === "inline";
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
      (shouldFocusSuccessRef.current || selectionHadFocusRef.current) &&
      !focusMovedOutside
    ) {
      successRef.current?.focus();
    }
  }, [containerRef, selectionHadFocusRef, state]);

  if (state === "done") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-slot="feedback-status"
        className={cn(
          inline
            ? [feedbackStyles.success, feedbackStyles.inlineSuccess]
            : feedbackStyles.thanks,
          feedbackStyles.focus,
          className,
        )}
      >
        {inline ? (
          <>
            <CheckCircle2
              className={feedbackStyles.statusIcon}
              aria-hidden="true"
            />
            <span>{thankYouMessage}</span>
          </>
        ) : (
          <>
            <span className={feedbackStyles.thanksBadge} aria-hidden="true">
              <Check className="size-5" strokeWidth={2.25} />
            </span>
            <span className={feedbackStyles.thanksTitle}>
              {thankYouMessage}
            </span>
            {thankYouDescription ? (
              <span className={feedbackStyles.thanksDetail}>
                {thankYouDescription}
              </span>
            ) : null}
          </>
        )}
      </div>
    );
  }

  if (state !== "selected" && state !== "submitting") return null;
  // A pick that sends at once shows progress in its segment; the actions
  // appear only to retry a failed send.
  if (!showFollowUp && !submitError) return null;

  const pending = disabled || state === "submitting";
  const errorOrHint = submitError ? (
    <p
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(feedbackStyles.error, inline && feedbackStyles.inlineError)}
    >
      <CircleAlert
        className={cn(
          feedbackStyles.errorIcon,
          inline && feedbackStyles.inlineErrorIcon,
        )}
        aria-hidden="true"
      />
      <span>{submitError.message}</span>
    </p>
  ) : inline && hint ? (
    <p className={feedbackStyles.hint}>{hint}</p>
  ) : null;

  return (
    <div
      data-slot="feedback-footer"
      className={cn(
        inline ? feedbackStyles.inlineFooter : feedbackStyles.footer,
        className,
      )}
    >
      {state === "submitting" ? (
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          Sending feedback
        </p>
      ) : null}
      {inline ? errorOrHint : null}
      <div
        className={
          inline ? feedbackStyles.inlineActions : feedbackStyles.actions
        }
      >
        {showCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={reset}
            className={cn(
              feedbackStyles.action,
              inline && feedbackStyles.compactAction,
              inline ? feedbackStyles.ghostCancel : feedbackStyles.cancel,
              feedbackStyles.focus,
            )}
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          ref={submitButtonRef}
          type="button"
          disabled={pending}
          aria-busy={state === "submitting" || undefined}
          onClick={() => {
            shouldFocusSuccessRef.current =
              document.activeElement === submitButtonRef.current;
            void submitSelected(text);
          }}
          onBlur={(event) => {
            if (event.relatedTarget) shouldFocusSuccessRef.current = false;
          }}
          className={cn(
            feedbackStyles.action,
            inline && feedbackStyles.compactAction,
            feedbackStyles.submit,
            feedbackStyles.focus,
          )}
        >
          {state === "submitting" ? (
            <>
              <LoaderCircle
                className={cn(
                  feedbackStyles.statusIcon,
                  "animate-spin text-current motion-reduce:animate-none",
                )}
                aria-hidden="true"
              />
              Sending…
            </>
          ) : submitError ? (
            "Try again"
          ) : (
            submitLabel
          )}
        </Button>
      </div>
      {inline ? null : errorOrHint}
    </div>
  );
}
