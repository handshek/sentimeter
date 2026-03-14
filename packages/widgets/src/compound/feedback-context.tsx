"use client";

import * as React from "react";
import type {
  WidgetCallbacks,
  WidgetPayload,
  WidgetState,
  WidgetSubmit,
  WidgetType,
} from "../types";
import { useWidgetMachine } from "../core/use-widget-machine";

export type WidgetSize = "sm" | "default" | "md" | "lg";

/* ── Context value ─────────────────────────────────────────── */

export type FeedbackContextValue = {
  state: WidgetState;
  selectedValue: number | null;
  hidden: boolean;
  disabled: boolean;
  size: WidgetSize;
  select: (value: number) => void;
  submitSelected: (text?: string) => void;
  cancel: () => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
};

const Ctx = React.createContext<FeedbackContextValue | null>(null);

export function useFeedbackContext(): FeedbackContextValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "Feedback compound components must be used inside <FeedbackWidget>.",
    );
  }
  return ctx;
}

/* ── Provider props ────────────────────────────────────────── */

export type FeedbackProviderProps = {
  apiKey: string;
  location: string;
  widgetType: WidgetType;
  disabled?: boolean;
  size?: WidgetSize;
  doneDurationMs?: number;
  submit?: WidgetSubmit;
  children: React.ReactNode;
} & WidgetCallbacks;

export function FeedbackProvider({
  apiKey,
  location,
  widgetType,
  disabled = false,
  size = "default",
  doneDurationMs = 2000,
  submit,
  children,
  onSelect,
  onStateChange,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
  onCancel,
}: FeedbackProviderProps) {
  const payloadBase = React.useMemo<Omit<WidgetPayload, "value">>(
    () => ({ apiKey, location, widgetType }),
    [apiKey, location, widgetType],
  );

  const machine = useWidgetMachine({
    payloadBase,
    disabled,
    doneDurationMs,
    submit: submit ?? (async () => {}),
    onSelect,
    onStateChange,
    onSubmitStart,
    onSubmitSuccess,
    onSubmitError,
  });

  const [text, setText] = React.useState("");

  const cancel = React.useCallback(() => {
    machine.hide();
    onCancel?.();
  }, [machine, onCancel]);

  const value = React.useMemo<FeedbackContextValue>(
    () => ({
      state: machine.state,
      selectedValue: machine.selectedValue,
      hidden: machine.hidden,
      disabled: !!disabled,
      size,
      select: machine.select,
      submitSelected: machine.submitSelected,
      cancel,
      text,
      setText,
    }),
    [machine, disabled, size, cancel, text],
  );

  return <Ctx value={value}>{children}</Ctx>;
}
