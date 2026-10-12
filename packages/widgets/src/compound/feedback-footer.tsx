"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useFeedbackContext } from "./feedback-context";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { feedbackStyles } from "../design-system";

export type FeedbackFooterProps = {
  submitLabel?: string;
  /** Clears the unsent choice and comment. */
  cancelLabel?: string;
  showCancel?: boolean;
  thankYouMessage?: React.ReactNode;
  /** A short note at the start of the inline footer, such as "Optional". */
  hint?: React.ReactNode;
  className?: string;
};

export function FeedbackFooter({
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancel = true,
  thankYouMessage = "Thanks!",
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
    layout,
  } = useFeedbackContext();
  const inline = layout === "inline";
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const [actionHeight, setActionHeight] = React.useState(0);
  const submitButtonRef = React.useRef<HTMLButtonElement>(null);
  const successRef = React.useRef<HTMLDivElement>(null);
  const shouldFocusSuccessRef = React.useRef(false);
  const actionStyle = actionHeight
    ? { minHeight: `max(var(--feedback-action-height), ${actionHeight}px)` }
    : undefined;

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
        data-slot="feedback-status"
        className={cn(
          feedbackStyles.success,
          inline && feedbackStyles.inlineSuccess,
          feedbackStyles.focus,
          className,
        )}
        // Inline feedback collapses back to its bar, so only the stacked
        // card keeps the measured action footprint.
        style={inline ? undefined : actionStyle}
      >
        <CheckCircle2
          className={feedbackStyles.statusIcon}
          aria-hidden="true"
        />
        <span>{thankYouMessage}</span>
      </div>
    );
  }

  if (state !== "selected" && state !== "submitting") return null;

  const pending = disabled || state === "submitting";

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
          Submitting feedback
        </p>
      ) : null}
      {submitError ? (
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={cn(
            feedbackStyles.error,
            inline && feedbackStyles.inlineError,
          )}
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
      ) : null}
      <div
        ref={actionsRef}
        className={
          inline ? feedbackStyles.inlineActions : feedbackStyles.actions
        }
        style={actionStyle}
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
            const height = actionsRef.current?.offsetHeight ?? 0;
            setActionHeight((previousHeight) =>
              Math.max(previousHeight, height),
            );
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
              Submitting…
            </>
          ) : submitError ? (
            "Try again"
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}
