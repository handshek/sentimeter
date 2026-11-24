"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { X } from "lucide-react";
import { FeedbackForm, type FeedbackFormProps } from "./feedback-form";
import { feedbackStyles, feedbackTheme } from "./feedback-system";

const PROBLEM_EVENT = "sentimeter:problem";
const SHOWN_KEY = "sentimeter:toast-feedback-shown";
const DEAD_CLICKS = 3;
const DEAD_CLICK_WINDOW_MS = 1000;
const INTERACTIVE =
  "a,button,input,select,textarea,summary,label,[role=button],[role=link],[contenteditable=true],[tabindex]:not([tabindex='-1'])";

/** Call after a failed request or action to offer the feedback toast. */
export function reportProblem(error?: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PROBLEM_EVENT, { detail: { error } }));
}

function alreadyShown() {
  try {
    return window.sessionStorage.getItem(SHOWN_KEY) === "1";
  } catch {
    return false;
  }
}

function markShown() {
  try {
    window.sessionStorage.setItem(SHOWN_KEY, "1");
  } catch {
    // Without storage the toast can only limit itself per page load.
  }
}

export type ToastFeedbackProps = {
  /** Offer the toast after repeated clicks on something that does nothing. */
  detectDeadClicks?: boolean;
  message?: string;
  actionLabel?: string;
  className?: string;
} & Omit<FeedbackFormProps, "error" | "onDone" | "className">;

/**
 * Mount once near the app root. After `reportProblem()` or repeated dead
 * clicks, at most once per session, a quiet toast asks whether something is
 * broken and opens the Feedback Form with the error attached.
 */
export function ToastFeedback({
  detectDeadClicks = true,
  message = "Something not working?",
  actionLabel = "Tell us",
  className,
  ...formProps
}: ToastFeedbackProps) {
  const [phase, setPhase] = React.useState<"hidden" | "toast" | "form">(
    "hidden",
  );
  const [error, setError] = React.useState<unknown>();
  const shownRef = React.useRef(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const offer = React.useCallback((nextError?: unknown) => {
    if (shownRef.current || alreadyShown()) return;
    shownRef.current = true;
    markShown();
    setError(nextError);
    setPhase("toast");
  }, []);

  React.useEffect(() => {
    const onProblem = (event: Event) =>
      offer((event as CustomEvent<{ error?: unknown }>).detail?.error);
    window.addEventListener(PROBLEM_EVENT, onProblem);
    return () => window.removeEventListener(PROBLEM_EVENT, onProblem);
  }, [offer]);

  React.useEffect(() => {
    if (!detectDeadClicks) return;
    let target: EventTarget | null = null;
    let times: number[] = [];
    const onClick = (event: MouseEvent) => {
      const element = event.target;
      if (!(element instanceof Element)) return;
      if (element.closest(INTERACTIVE) || rootRef.current?.contains(element)) {
        times = [];
        return;
      }
      const now = event.timeStamp;
      if (element !== target) {
        target = element;
        times = [];
      }
      times = [...times.filter((t) => now - t < DEAD_CLICK_WINDOW_MS), now];
      if (times.length >= DEAD_CLICKS) {
        times = [];
        offer();
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [detectDeadClicks, offer]);

  React.useEffect(() => {
    if (phase === "hidden") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhase("hidden");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase]);

  React.useEffect(() => {
    if (phase === "form") rootRef.current?.querySelector("textarea")?.focus();
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      ref={rootRef}
      data-slot="feedback-toast"
      className={cn(
        feedbackTheme.className,
        feedbackStyles.toastRoot,
        className,
      )}
      style={feedbackTheme.style as React.CSSProperties}
    >
      {phase === "toast" ? (
        <div role="status" aria-live="polite" className={feedbackStyles.toast}>
          <span className="min-w-0 flex-1">{message}</span>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPhase("form")}
            className={cn(
              feedbackStyles.action,
              feedbackStyles.compactAction,
              feedbackStyles.cancel,
              feedbackStyles.focus,
            )}
          >
            {actionLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Dismiss"
            onClick={() => setPhase("hidden")}
            className={cn(feedbackStyles.toastClose, feedbackStyles.focus)}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <FeedbackForm
            {...formProps}
            error={error}
            onDone={() => setPhase("hidden")}
            className="max-w-none"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close feedback"
            onClick={() => setPhase("hidden")}
            className={cn(feedbackStyles.close, feedbackStyles.focus)}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
