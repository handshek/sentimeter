"use client";

import * as React from "react";
import type {
  WidgetCallbacks,
  WidgetLayout,
  WidgetFollowUp,
  RatingPayload,
  WidgetState,
  WidgetSubmit,
  WidgetSubmitError,
  RatingWidgetType,
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
  /** Whether the current pick is a negative one, such as 1–2 stars. */
  negativePick: boolean;
  select: (value: number) => void;
  submitSelected: (text?: string) => Promise<void>;
  /**
   * Clears an unsent choice and comment, returning to idle. Focus returns to
   * the first choice unless `restoreFocus` is false. Returns whether it reset.
   */
  reset: (options?: { restoreFocus?: boolean }) => boolean;
  /** Counts completed resets, so parts can drop their own unsent state. */
  resets: number;
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
  widgetType: RatingWidgetType;
  disabled?: boolean;
  size?: WidgetSize;
  layout?: WidgetLayout;
  followUp?: WidgetFollowUp;
  submit?: WidgetSubmit<RatingPayload>;
  children: React.ReactNode;
} & WidgetCallbacks<RatingPayload>;

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
  const payloadBase = React.useMemo<Omit<RatingPayload, "value">>(
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
  const [resets, setResets] = React.useState(0);
  const reset = React.useCallback(
    ({ restoreFocus = true }: { restoreFocus?: boolean } = {}) => {
      focusChoiceRef.current =
        restoreFocus &&
        typeof document !== "undefined" &&
        !!containerRef.current?.contains(document.activeElement);
      if (!resetMachine()) return false;
      setText("");
      setResets((count) => count + 1);
      notify(onReset);
      return true;
    },
    [onReset, resetMachine],
  );

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

  const negativePick =
    machine.selectedValue !== null &&
    requiresFollowUp("negative", widgetType, machine.selectedValue);

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
      negativePick,
      select,
      submitSelected: machine.submitSelected,
      reset,
      resets,
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
      resets,
      cancel,
      text,
      showFollowUp,
      negativePick,
      select,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
