"use client";

import * as React from "react";
import type { WidgetPayload, WidgetState, WidgetSubmit } from "../types";

type UseWidgetMachineArgs = {
  payloadBase: Omit<WidgetPayload, "value">;
  disabled?: boolean;
  doneDurationMs: number;
  submit: WidgetSubmit;
  onStateChange?: (state: WidgetState) => void;
  onSelect?: (value: number) => void;
  onSubmitStart?: (payload: WidgetPayload) => void;
  onSubmitSuccess?: (payload: WidgetPayload) => void;
  onSubmitError?: (error: unknown, payload: WidgetPayload) => void;
};

export function useWidgetMachine({
  payloadBase,
  disabled,
  doneDurationMs,
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

  const setStateSafe = React.useCallback(
    (next: WidgetState) => {
      setState(next);
      onStateChange?.(next);
    },
    [onStateChange],
  );

  React.useEffect(() => {
    if (state !== "done") return;
    const t = window.setTimeout(() => setHidden(true), doneDurationMs);
    return () => window.clearTimeout(t);
  }, [doneDurationMs, state]);

  const select = React.useCallback(
    (value: number) => {
      if (disabled) return;
      if (state === "submitting" || state === "done") return;
      setSelectedValue(value);
      onSelect?.(value);
      setStateSafe("selected");
    },
    [disabled, onSelect, setStateSafe, state],
  );

  const submitSelected = React.useCallback(
    async (text?: string) => {
      if (disabled) return;
      if (state !== "selected") return;
      if (selectedValue == null) return;

      const payload: WidgetPayload = {
        ...payloadBase,
        value: selectedValue,
        ...(text ? { text } : {}),
      };
      setStateSafe("submitting");
      onSubmitStart?.(payload);

      try {
        await submit(payload);
        onSubmitSuccess?.(payload);
        setStateSafe("done");
      } catch (error) {
        onSubmitError?.(error, payload);
        setStateSafe("selected");
      }
    },
    [
      disabled,
      onSubmitError,
      onSubmitStart,
      onSubmitSuccess,
      payloadBase,
      selectedValue,
      setStateSafe,
      state,
      submit,
    ],
  );

  const hide = React.useCallback(() => setHidden(true), []);

  return {
    hidden,
    state,
    selectedValue,
    select,
    submitSelected,
    hide,
  } as const;
}
