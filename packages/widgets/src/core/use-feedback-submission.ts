"use client";

import * as React from "react";
import type {
  WidgetCallbacks,
  WidgetPayload,
  WidgetState,
  WidgetSubmit,
  WidgetSubmitError,
} from "../types";
import { normalizeSubmitError } from "./errors";

// Observer failures must not cause a saved response to be sent again.
export function notify<Args extends unknown[]>(
  callback: ((...args: Args) => void) | undefined,
  ...args: Args
) {
  const report = (error: unknown) =>
    console.error("Sentimeter widget callback threw:", error);
  try {
    const result: unknown = callback?.(...args);
    if (result instanceof Promise) result.catch(report);
  } catch (error) {
    report(error);
  }
}

export function useFeedbackSubmission<P extends WidgetPayload>({
  submit,
  onStateChange,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
}: Pick<
  WidgetCallbacks<P>,
  "onStateChange" | "onSubmitStart" | "onSubmitSuccess" | "onSubmitError"
> & { submit?: WidgetSubmit<P> }) {
  const [state, setState] = React.useState<WidgetState>("idle");
  const [submitError, setSubmitError] =
    React.useState<WidgetSubmitError | null>(null);
  // The synchronous guard also blocks repeated calls before React renders.
  const stateRef = React.useRef<WidgetState>("idle");
  const setStateSafe = React.useCallback(
    (next: WidgetState) => {
      stateRef.current = next;
      setState(next);
      notify(onStateChange, next);
    },
    [onStateChange],
  );
  const clearError = React.useCallback(() => setSubmitError(null), []);
  const submitPayload = React.useCallback(
    async (payload: P) => {
      if (stateRef.current === "submitting" || stateRef.current === "done")
        return;
      const previousState = stateRef.current;
      clearError();
      setStateSafe("submitting");
      notify(onSubmitStart, payload);
      try {
        await submit?.(payload);
      } catch (error) {
        notify(onSubmitError, error, payload);
        setSubmitError(normalizeSubmitError(error));
        setStateSafe(previousState);
        return;
      }
      clearError();
      notify(onSubmitSuccess, payload);
      setStateSafe("done");
    },
    [
      clearError,
      onSubmitError,
      onSubmitStart,
      onSubmitSuccess,
      setStateSafe,
      submit,
    ],
  );
  return {
    state,
    stateRef,
    submitError,
    setStateSafe,
    clearError,
    submitPayload,
  };
}
