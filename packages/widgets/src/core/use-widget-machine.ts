"use client";

import * as React from "react";
import type {
  WidgetPayload,
  RatingPayload,
  RatingWidgetType,
  WidgetFollowUp,
  WidgetState,
  WidgetSubmit,
} from "../types";
import { notify, useFeedbackSubmission } from "./use-feedback-submission";
export { notify } from "./use-feedback-submission";

type UseWidgetMachineArgs = {
  payloadBase: Omit<RatingPayload, "value">;
  followUp?: WidgetFollowUp;
  disabled?: boolean;
  submit: WidgetSubmit<RatingPayload>;
  onStateChange?: (state: WidgetState) => void;
  onSelect?: (value: number) => void;
  onSubmitStart?: (payload: RatingPayload) => void;
  onSubmitSuccess?: (payload: RatingPayload) => void;
  onSubmitError?: (error: unknown, payload: RatingPayload) => void;
};

export function requiresFollowUp(
  followUp: WidgetFollowUp | undefined,
  widgetType: RatingWidgetType,
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
  const {
    state,
    stateRef,
    submitError,
    setStateSafe,
    clearError,
    submitPayload,
  } = useFeedbackSubmission({
    submit,
    onStateChange,
    onSubmitStart,
    onSubmitSuccess,
    onSubmitError,
  });
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
  const [hidden, setHidden] = React.useState(false);
  const selectedValueRef = React.useRef<number | null>(null);

  const submitValue = React.useCallback(
    async (value: number, text?: string) => {
      if (disabled) return;
      if (stateRef.current !== "selected") return;

      const payload: WidgetPayload = {
        ...payloadBase,
        value,
        ...(text ? { text } : {}),
      };
      await submitPayload(payload);
    },
    [disabled, payloadBase, stateRef, submitPayload],
  );

  const select = React.useCallback(
    (value: number) => {
      if (disabled) return false;
      if (stateRef.current === "submitting" || stateRef.current === "done") {
        return false;
      }
      clearError();
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
      clearError,
      disabled,
      followUp,
      onSelect,
      payloadBase.widgetType,
      setStateSafe,
      submitValue,
      stateRef,
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
    clearError();
    selectedValueRef.current = null;
    setSelectedValue(null);
    setStateSafe("idle");
    return true;
  }, [clearError, disabled, setStateSafe, stateRef]);

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
