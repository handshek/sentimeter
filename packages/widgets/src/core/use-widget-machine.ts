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

  const setStateSafe = React.useCallback(
    (next: WidgetState) => {
      setState(next);
      onStateChange?.(next);
    },
    [onStateChange],
  );

  const select = React.useCallback(
    (value: number) => {
      if (disabled) return;
      if (state === "submitting" || state === "done") return;
      setSubmitError(null);
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
      setSubmitError(null);
      setStateSafe("submitting");
      onSubmitStart?.(payload);

      try {
        await submit(payload);
        setSubmitError(null);
        onSubmitSuccess?.(payload);
        setStateSafe("done");
      } catch (error) {
        onSubmitError?.(error, payload);
        setSubmitError(normalizeSubmitError(error));
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
    submitError,
    select,
    submitSelected,
    hide,
  } as const;
}
