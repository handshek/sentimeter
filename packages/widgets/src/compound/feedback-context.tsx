"use client";

import * as React from "react";
import type {
  WidgetCallbacks,
  WidgetPayload,
  WidgetState,
  WidgetSubmit,
  WidgetSubmitError,
  WidgetType,
} from "../types";
import { DEFAULT_FEEDBACK_ENDPOINT, submitFeedback } from "../core/submit";
import { useWidgetMachine } from "../core/use-widget-machine";

export type WidgetSize = "sm" | "default" | "md" | "lg";

/* ── Context value ─────────────────────────────────────────── */

export type FeedbackContextValue = {
  state: WidgetState;
  selectedValue: number | null;
  submitError: WidgetSubmitError | null;
  hidden: boolean;
  disabled: boolean;
  size: WidgetSize;
  select: (value: number) => void;
  submitSelected: (text?: string) => Promise<void>;
  cancel: () => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  focusAnchorRef: React.RefObject<HTMLSpanElement | null>;
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
  apiKey?: string;
  location?: string;
  endpoint?: string;
  widgetType: WidgetType;
  disabled?: boolean;
  size?: WidgetSize;
  doneDurationMs?: number;
  autoHide?: boolean;
  submit?: WidgetSubmit;
  children: React.ReactNode;
} & WidgetCallbacks;

export function FeedbackProvider({
  apiKey = "",
  location = "/",
  endpoint = DEFAULT_FEEDBACK_ENDPOINT,
  widgetType,
  disabled = false,
  size = "default",
  doneDurationMs = 2000,
  autoHide = true,
  submit,
  children,
  onSelect,
  onStateChange,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
  onCancel,
}: FeedbackProviderProps) {
  const normalizedApiKey = apiKey.trim();
  const payloadBase = React.useMemo<Omit<WidgetPayload, "value">>(
    () => ({ apiKey: normalizedApiKey, location, widgetType }),
    [location, normalizedApiKey, widgetType],
  );

  const defaultSubmit = React.useCallback<WidgetSubmit>(
    (payload) => submitFeedback(payload, endpoint),
    [endpoint],
  );

  const localSubmit = React.useCallback<WidgetSubmit>(async () => {}, []);

  const resolvedSubmit =
    submit ?? (normalizedApiKey ? defaultSubmit : localSubmit);

  const machine = useWidgetMachine({
    payloadBase,
    disabled,
    submit: resolvedSubmit,
    onSelect,
    onStateChange,
    onSubmitStart,
    onSubmitSuccess,
    onSubmitError,
  });
  const hideMachine = machine.hide;

  const [text, setText] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const focusAnchorRef = React.useRef<HTMLSpanElement>(null);
  const shouldRestoreFocusRef = React.useRef(false);

  const hide = React.useCallback(() => {
    shouldRestoreFocusRef.current =
      typeof document !== "undefined" &&
      !!containerRef.current?.contains(document.activeElement);
    hideMachine();
  }, [hideMachine]);

  React.useEffect(() => {
    if (machine.state !== "done" || !autoHide) return;
    const timer = window.setTimeout(hide, doneDurationMs);
    return () => window.clearTimeout(timer);
  }, [autoHide, doneDurationMs, hide, machine.state]);

  React.useEffect(() => {
    if (machine.hidden && shouldRestoreFocusRef.current) {
      focusAnchorRef.current?.focus();
    }
  }, [machine.hidden]);

  const cancel = React.useCallback(() => {
    hide();
    onCancel?.();
  }, [hide, onCancel]);

  const value = React.useMemo<FeedbackContextValue>(
    () => ({
      state: machine.state,
      selectedValue: machine.selectedValue,
      submitError: machine.submitError,
      hidden: machine.hidden,
      disabled: !!disabled,
      size,
      select: machine.select,
      submitSelected: machine.submitSelected,
      cancel,
      text,
      setText,
      containerRef,
      focusAnchorRef,
    }),
    [machine, disabled, size, cancel, text],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
