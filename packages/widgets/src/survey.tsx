"use client";

import * as React from "react";
import {
  FeedbackFormActions,
  FeedbackFormCard,
  FeedbackRadioGroup,
  FeedbackResponse,
  FeedbackTextField,
  useFeedbackDone,
  useFeedbackSubmission,
  type FeedbackStyle,
  type SurveyPayload,
  type WidgetCallbacks,
  type WidgetSubmit,
} from "./feedback-system";

export type SurveyOption = {
  label: string;
  value: string;
  notePlaceholder?: string;
};

const DEFAULT_OPTIONS = [
  {
    label: "Too expensive",
    value: "too-expensive",
    notePlaceholder: "What would make it worth the price? (optional)",
  },
  {
    label: "Something didn't work",
    value: "not-working",
    notePlaceholder: "What didn't work? (optional)",
  },
  {
    label: "Missing a feature I need",
    value: "missing-feature",
    notePlaceholder: "What's missing? (optional)",
  },
  {
    label: "Switching to another tool",
    value: "switching",
    notePlaceholder: "What are you switching to? (optional)",
  },
  {
    label: "Other",
    value: "other",
    notePlaceholder: "Tell us more (optional)",
  },
] as const satisfies readonly SurveyOption[];

export type SurveyProps = {
  title?: string;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  location?: string;
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  submit?: WidgetSubmit<SurveyPayload>;
  onDone?: () => void;
  description?: string;
  /** Values must be unique. Each reason can supply its own note prompt. */
  options?: readonly SurveyOption[];
  /** Skip saves nothing; the host decides whether to dismiss or continue. */
  onSkip?: () => void;
  skipLabel?: string;
} & Pick<
  WidgetCallbacks<SurveyPayload>,
  "onStateChange" | "onSubmitStart" | "onSubmitSuccess" | "onSubmitError"
>;

export function Survey({
  title = "Why are you leaving?",
  description = "One click helps us improve.",
  options = DEFAULT_OPTIONS,
  submitLabel = "Send",
  thankYouMessage = "Thanks for telling us.",
  location = "/",
  disabled = false,
  className,
  style,
  submit,
  onDone,
  onSkip,
  skipLabel,
  ...callbacks
}: SurveyProps) {
  const machine = useFeedbackSubmission({ submit, ...callbacks });
  const [value, setValue] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");
  const titleId = React.useId();
  const errorId = React.useId();
  useFeedbackDone(machine.state, onDone);
  const selectedOption = options.find((option) => option.value === value);
  const pending = disabled || machine.state === "submitting";
  const locked = pending || machine.state === "done";
  const notePrompt =
    selectedOption?.notePlaceholder ?? "Tell us more (optional)";
  return (
    <FeedbackFormCard
      state={machine.state}
      disabled={disabled}
      title={title}
      description={description}
      titleId={titleId}
      className={className}
      style={style}
    >
      <FeedbackResponse>
        <FeedbackRadioGroup
          options={options}
          value={selectedOption?.value ?? null}
          disabled={locked}
          labelledBy={titleId}
          selectOption={(next) => {
            if (locked) return;
            if (next !== value) setText("");
            setValue(next);
            machine.clearError();
            machine.setStateSafe("selected");
          }}
        />
        {selectedOption && machine.state !== "done" ? (
          <FeedbackTextField
            label={notePrompt}
            placeholder={notePrompt}
            text={text}
            setText={setText}
            disabled={pending}
            describedBy={machine.submitError ? errorId : undefined}
          />
        ) : null}
      </FeedbackResponse>
      <FeedbackFormActions
        state={machine.state}
        submitError={machine.submitError}
        disabled={disabled}
        canSubmit={!!selectedOption}
        submitLabel={submitLabel}
        errorId={errorId}
        thankYouMessage={thankYouMessage}
        onSkip={onSkip}
        skipLabel={skipLabel}
        onSubmit={() => {
          if (pending || !selectedOption) return;
          void machine.submitPayload({
            widgetType: "survey",
            location,
            value: selectedOption.value,
            ...(text.trim() ? { text: text.trim() } : {}),
          });
        }}
      />
    </FeedbackFormCard>
  );
}
