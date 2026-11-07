"use client";

import * as React from "react";
import type {
  WidgetCallbacks,
  WidgetLayout,
  WidgetFollowUp,
  WidgetPayload,
  WidgetState,
  WidgetSubmit,
  WidgetSubmitError,
  WidgetType,
} from "../types";
import {
  notify,
  requiresFollowUp,
  useWidgetMachine,
} from "../core/use-widget-machine";

export type WidgetSize = "sm" | "default" | "md" | "lg";

export type FeedbackContextValue = {
  state: WidgetState;
  selectedValue: number | null;
  submitError: WidgetSubmitError | null;
  hidden: boolean;
  disabled: boolean;
  size: WidgetSize;
  layout: WidgetLayout;
  showFollowUp: boolean;
  select: (value: number) => void;
  submitSelected: (text?: string) => Promise<void>;
  /** Clears an unsent choice and comment, returning to idle. */
  reset: () => void;
  /** Dismisses the whole widget. */
  cancel: () => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  focusAnchorRef: React.RefObject<HTMLSpanElement | null>;
  selectionHadFocusRef: React.RefObject<boolean>;
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

export type FeedbackProviderProps = {
  location?: string;
  widgetType: WidgetType;
  disabled?: boolean;
  size?: WidgetSize;
  layout?: WidgetLayout;
  followUp?: WidgetFollowUp;
  submit?: WidgetSubmit;
  children: React.ReactNode;
} & WidgetCallbacks;

export function FeedbackProvider({
  location = "/",
  widgetType,
  disabled = false,
  size = "default",
  layout = "stacked",
  followUp,
  submit,
  children,
  onSelect,
  onStateChange,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
  onCancel,
  onReset,
}: FeedbackProviderProps) {
  const payloadBase = React.useMemo<Omit<WidgetPayload, "value">>(
    () => ({ location, widgetType }),
    [location, widgetType],
  );

  const localSubmit = React.useCallback<WidgetSubmit>(async () => {}, []);

  const resolvedSubmit = submit ?? localSubmit;

  const machine = useWidgetMachine({
    payloadBase,
    followUp,
    disabled,
    submit: resolvedSubmit,
    onSelect,
    onStateChange,
    onSubmitStart,
    onSubmitSuccess,
    onSubmitError,
  });
  const hideMachine = machine.hide;
  const resetMachine = machine.reset;

  const [text, setText] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const focusAnchorRef = React.useRef<HTMLSpanElement>(null);
  const selectionHadFocusRef = React.useRef(false);
  const shouldRestoreFocusRef = React.useRef(false);

  const hide = React.useCallback(() => {
    shouldRestoreFocusRef.current =
      typeof document !== "undefined" &&
      !!containerRef.current?.contains(document.activeElement);
    hideMachine();
  }, [hideMachine]);

  React.useEffect(() => {
    if (machine.hidden && shouldRestoreFocusRef.current) {
      focusAnchorRef.current?.focus();
    }
  }, [machine.hidden]);

  const cancel = React.useCallback(() => {
    hide();
    notify(onCancel);
  }, [hide, onCancel]);

  // Cancel unmounts itself, so focus returns to the choices it cleared.
  const focusChoiceRef = React.useRef(false);
  const reset = React.useCallback(() => {
    focusChoiceRef.current =
      typeof document !== "undefined" &&
      !!containerRef.current?.contains(document.activeElement);
    if (!resetMachine()) return;
    setText("");
    notify(onReset);
  }, [onReset, resetMachine]);

  React.useEffect(() => {
    if (machine.state !== "idle" || !focusChoiceRef.current) return;
    focusChoiceRef.current = false;
    containerRef.current
      ?.querySelector<HTMLButtonElement>('[data-slot="feedback-choice"]')
      ?.focus();
  }, [machine.state]);

  const select = React.useCallback(
    (value: number) => {
      if (
        disabled ||
        machine.state === "submitting" ||
        machine.state === "done"
      )
        return;
      selectionHadFocusRef.current = !!containerRef.current?.contains(
        document.activeElement,
      );
      if (
        machine.select(value) &&
        !requiresFollowUp(followUp, widgetType, value)
      ) {
        setText("");
      }
    },
    [disabled, followUp, machine, widgetType],
  );
  const showFollowUp =
    machine.selectedValue !== null &&
    requiresFollowUp(followUp, widgetType, machine.selectedValue);

  const value = React.useMemo<FeedbackContextValue>(
    () => ({
      state: machine.state,
      selectedValue: machine.selectedValue,
      submitError: machine.submitError,
      hidden: machine.hidden,
      disabled: !!disabled,
      size,
      layout,
      showFollowUp,
      select,
      submitSelected: machine.submitSelected,
      reset,
      cancel,
      text,
      setText,
      containerRef,
      focusAnchorRef,
      selectionHadFocusRef,
    }),
    [
      machine,
      disabled,
      size,
      layout,
      reset,
      cancel,
      text,
      showFollowUp,
      select,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
