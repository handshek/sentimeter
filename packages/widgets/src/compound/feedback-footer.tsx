"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useFeedbackContext } from "./feedback-context";
import { Check, CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { feedbackStyles } from "../design-system";
import type { WidgetState } from "../types";

/**
 * Tracks the card's idle height so the thank-you can replace the card
 * without the page moving.
 */
export function useIdleHeight(state: WidgetState) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number>();
  React.useLayoutEffect(() => {
    const node = ref.current;
    if (state !== "idle" || !node || typeof ResizeObserver === "undefined")
      return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [state]);
  return {
    ref,
    style: state === "done" && height ? { minHeight: height } : undefined,
  };
}

/** The centred thank-you that replaces a finished card. */
export const FeedbackThanks = React.forwardRef<
  HTMLDivElement,
  {
    message: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
  }
>(function FeedbackThanks({ message, description, className }, ref) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-slot="feedback-status"
      className={cn(feedbackStyles.success, feedbackStyles.focus, className)}
    >
      <span aria-hidden="true" className={feedbackStyles.successBadge}>
        <Check />
      </span>
      <span className={feedbackStyles.successTitle}>{message}</span>
      {description ? (
        <span className={feedbackStyles.successDescription}>{description}</span>
      ) : null}
    </div>
  );
});

export type FeedbackFooterProps = {
  submitLabel?: string;
  /** Clears the unsent choice and comment. */
  cancelLabel?: string;
  showCancel?: boolean;
  thankYouMessage?: React.ReactNode;
  /** A quieter line under the thank-you in the stacked card. */
  thankYouDescription?: React.ReactNode;
  /** A short note at the start of the inline footer, such as "Optional". */
  hint?: React.ReactNode;
  className?: string;
};

export function FeedbackFooter({
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancel = true,
  thankYouMessage = "Thanks!",
  thankYouDescription,
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
    selectedValue,
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
  const sending = state === "submitting";
  // A retry keeps its row mounted so focus stays on Try again.
  const [retryValue, setRetryValue] = React.useState<number | null>(null);
  const retrying =
    sending && retryValue !== null && retryValue === selectedValue;

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

  if (state === "done" && !inline) {
    return (
      <FeedbackThanks
        ref={successRef}
        message={thankYouMessage}
        description={thankYouDescription}
        className={className}
      />
    );
  }

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
      >
        <CheckCircle2
          className={feedbackStyles.statusIcon}
          aria-hidden="true"
        />
        <span>{thankYouMessage}</span>
      </div>
    );
  }

  if (state !== "selected" && !sending) return null;

  // A pick without a note sends on its own, so there is nothing to confirm.
  if (!showFollowUp && !submitError && !retrying) {
    return sending ? (
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Sending feedback
      </p>
    ) : null;
  }

  const pending = disabled || sending;
  const error = submitError ? (
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
      {inline
        ? (error ??
          (sending ? (
            <p aria-hidden="true" className={feedbackStyles.hint}>
              Sending…
            </p>
          ) : hint ? (
            <p className={feedbackStyles.hint}>{hint}</p>
          ) : null))
        : null}
      <div
        ref={actionsRef}
        className={
          inline ? feedbackStyles.inlineActions : feedbackStyles.actions
        }
        style={actionStyle}
      >
        {/* Inline keeps one action while sending or retrying. */}
        {showCancel && !(inline && (sending || submitError)) ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              setRetryValue(null);
              reset();
            }}
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
            setRetryValue(submitError ? selectedValue : null);
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
          {state === "submitting" && inline ? (
            submitLabel
          ) : state === "submitting" ? (
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
      {inline ? null : error}
    </div>
  );
}
