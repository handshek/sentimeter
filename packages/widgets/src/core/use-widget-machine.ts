"use client";

import * as React from "react";
import type {
  WidgetPayload,
  WidgetState,
  WidgetSubmit,
  WidgetSubmitError,
} from "../types";
import { normalizeSubmitError } from "./submit";

type UseWidgetMachineArgs = {
  payloadBase: Omit<WidgetPayload, "value">;
  disabled?: boolean;
  submit: WidgetSubmit;
  onStateChange?: (state: WidgetState) => void;
  onSelect?: (value: number) => void;
  onSubmitStart?: (payload: WidgetPayload) => void;
  onSubmitSuccess?: (payload: WidgetPayload) => void;
  onSubmitError?: (error: unknown, payload: WidgetPayload) => void;
};

// Host callbacks are observers: a throwing callback must not change what the
// widget shows or whether feedback is sent again. Async callbacks are not
// awaited, so callback order stays the same, but their rejections are logged.
function reportCallbackError(error: unknown) {
  console.error("Sentimeter widget callback threw:", error);
}

export function notify<Args extends unknown[]>(
  callback: ((...args: Args) => void) | undefined,
  ...args: Args
) {
  try {
    const result: unknown = callback?.(...args);
    if (result instanceof Promise) result.catch(reportCallbackError);
  } catch (error) {
    reportCallbackError(error);
  }
}

export function useWidgetMachine({
  payloadBase,
  disabled,
  submit,
  onStateChange,
  onSelect,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
}: UseWidgetMachineArgs) {
  const [state, setState] = React.useState<WidgetState>("idle");
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
  const [hidden, setHidden] = React.useState(false);
  const [submitError, setSubmitError] =
    React.useState<WidgetSubmitError | null>(null);

  // Mirrors `state` synchronously so repeated calls in one tick, before React
  // re-renders, cannot submit the same response twice.
  const stateRef = React.useRef<WidgetState>("idle");

  const setStateSafe = React.useCallback(
    (next: WidgetState) => {
      stateRef.current = next;
      setState(next);
      notify(onStateChange, next);
    },
    [onStateChange],
  );

  const select = React.useCallback(
    (value: number) => {
      if (disabled) return;
      if (stateRef.current === "submitting" || stateRef.current === "done") {
        return;
      }
      setSubmitError(null);
      setSelectedValue(value);
      notify(onSelect, value);
      setStateSafe("selected");
    },
    [disabled, onSelect, setStateSafe],
  );

  const submitSelected = React.useCallback(
    async (text?: string) => {
      if (disabled) return;
      if (stateRef.current !== "selected") return;
      if (selectedValue == null) return;

      const payload: WidgetPayload = {
        ...payloadBase,
        value: selectedValue,
        ...(text ? { text } : {}),
      };
      setSubmitError(null);
      setStateSafe("submitting");
      notify(onSubmitStart, payload);

      try {
        await submit(payload);
      } catch (error) {
        notify(onSubmitError, error, payload);
        setSubmitError(normalizeSubmitError(error));
        setStateSafe("selected");
        return;
      }

      setSubmitError(null);
      notify(onSubmitSuccess, payload);
      setStateSafe("done");
    },
    [
      disabled,
      onSubmitError,
      onSubmitStart,
      onSubmitSuccess,
      payloadBase,
      selectedValue,
      setStateSafe,
      submit,
    ],
  );

  const hide = React.useCallback(() => setHidden(true), []);

  return {
    hidden,
    state,
    selectedValue,
    submitError,
    select,
    submitSelected,
    hide,
  } as const;
}
