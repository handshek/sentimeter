"use client";

import * as React from "react";
import type {
  WidgetPayload,
  WidgetFollowUp,
  WidgetState,
  WidgetSubmit,
  WidgetSubmitError,
} from "../types";
import { normalizeSubmitError } from "./errors";

type UseWidgetMachineArgs = {
  payloadBase: Omit<WidgetPayload, "value">;
  followUp?: WidgetFollowUp;
  disabled?: boolean;
  submit: WidgetSubmit;
  onStateChange?: (state: WidgetState) => void;
  onSelect?: (value: number) => void;
  onSubmitStart?: (payload: WidgetPayload) => void;
  onSubmitSuccess?: (payload: WidgetPayload) => void;
  onSubmitError?: (error: unknown, payload: WidgetPayload) => void;
};

export function requiresFollowUp(
  followUp: WidgetFollowUp | undefined,
  widgetType: WidgetPayload["widgetType"],
  value: number,
) {
  if (followUp === undefined || followUp === "always") return true;
  if (followUp === "never") return false;
  switch (widgetType) {
    case "thumbs":
      return value === 0;
    case "emoji":
    case "star":
      return value <= 2;
    case "nps":
      return value <= 6;
  }
}

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
  followUp,
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
  const selectedValueRef = React.useRef<number | null>(null);

  const setStateSafe = React.useCallback(
    (next: WidgetState) => {
      stateRef.current = next;
      setState(next);
      notify(onStateChange, next);
    },
    [onStateChange],
  );

  const submitValue = React.useCallback(
    async (value: number, text?: string) => {
      if (disabled) return;
      if (stateRef.current !== "selected") return;

      const payload: WidgetPayload = {
        ...payloadBase,
        value,
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
      setStateSafe,
      submit,
    ],
  );

  const select = React.useCallback(
    (value: number) => {
      if (disabled) return false;
      if (stateRef.current === "submitting" || stateRef.current === "done") {
        return false;
      }
      setSubmitError(null);
      selectedValueRef.current = value;
      setSelectedValue(value);
      notify(onSelect, value);
      setStateSafe("selected");
      if (!requiresFollowUp(followUp, payloadBase.widgetType, value)) {
        void submitValue(value);
      }
      return true;
    },
    [
      disabled,
      followUp,
      onSelect,
      payloadBase.widgetType,
      setStateSafe,
      submitValue,
    ],
  );

  const submitSelected = React.useCallback(
    async (text?: string) => {
      if (selectedValueRef.current === null) return;
      await submitValue(selectedValueRef.current, text);
    },
    [submitValue],
  );

  const reset = React.useCallback(() => {
    if (disabled || stateRef.current !== "selected") return false;
    setSubmitError(null);
    selectedValueRef.current = null;
    setSelectedValue(null);
    setStateSafe("idle");
    return true;
  }, [disabled, setStateSafe]);

  const hide = React.useCallback(() => setHidden(true), []);

  return {
    hidden,
    state,
    selectedValue,
    submitError,
    select,
    submitSelected,
    reset,
    hide,
  } as const;
}
