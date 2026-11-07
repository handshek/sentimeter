"use client";

import * as React from "react";
import type {
  WidgetPayload,
  WidgetState,
  WidgetSubmit,
  WidgetSubmitError,
} from "../types";
import { normalizeSubmitError } from "./errors";

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

// Only a chosen response carries a value, and only a failed send of it
// carries an error, so neither can outlive the state that owns it.
type Machine =
  | { state: "idle" }
  | { state: "selected"; value: number; error: WidgetSubmitError | null }
  | { state: "submitting"; value: number }
  | { state: "done"; value: number };

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
  const [machine, setMachine] = React.useState<Machine>({ state: "idle" });
  const [hidden, setHidden] = React.useState(false);

  // Mirrors `machine` synchronously so repeated calls in one tick, before
  // React re-renders, cannot submit the same response twice.
  const machineRef = React.useRef<Machine>(machine);

  const transition = React.useCallback(
    (next: Machine) => {
      machineRef.current = next;
      setMachine(next);
      notify(onStateChange, next.state);
    },
    [onStateChange],
  );

  const select = React.useCallback(
    (value: number) => {
      if (disabled) return;
      const { state } = machineRef.current;
      if (state === "submitting" || state === "done") return;
      notify(onSelect, value);
      transition({ state: "selected", value, error: null });
    },
    [disabled, onSelect, transition],
  );

  const submitSelected = React.useCallback(
    async (text?: string) => {
      if (disabled) return;
      const current = machineRef.current;
      if (current.state !== "selected") return;

      const { value } = current;
      const payload: WidgetPayload = {
        ...payloadBase,
        value,
        ...(text ? { text } : {}),
      };
      transition({ state: "submitting", value });
      notify(onSubmitStart, payload);

      try {
        await submit(payload);
      } catch (error) {
        notify(onSubmitError, error, payload);
        transition({
          state: "selected",
          value,
          error: normalizeSubmitError(error),
        });
        return;
      }

      notify(onSubmitSuccess, payload);
      transition({ state: "done", value });
    },
    [
      disabled,
      onSubmitError,
      onSubmitStart,
      onSubmitSuccess,
      payloadBase,
      submit,
      transition,
    ],
  );

  const reset = React.useCallback(() => {
    if (disabled || machineRef.current.state !== "selected") return false;
    transition({ state: "idle" });
    return true;
  }, [disabled, transition]);

  const hide = React.useCallback(() => setHidden(true), []);

  return {
    hidden,
    state: machine.state,
    selectedValue: machine.state === "idle" ? null : machine.value,
    submitError: machine.state === "selected" ? machine.error : null,
    select,
    submitSelected,
    reset,
    hide,
  } as const;
}
