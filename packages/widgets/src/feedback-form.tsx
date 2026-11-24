"use client";

import * as React from "react";
import {
  collectFeedbackContext,
  FeedbackFormActions,
  FeedbackFormCard,
  FeedbackResponse,
  FeedbackTextField,
  feedbackStyles,
  useFeedbackDone,
  useFeedbackSubmission,
  type FeedbackContext,
  type FeedbackStyle,
  type FormPayload,
  type WidgetCallbacks,
  type WidgetSubmit,
} from "./feedback-system";

function describeError(error: unknown) {
  if (error === undefined || error === null) return undefined;
  if (error instanceof Error) {
    return { name: error.name, message: error.message.slice(0, 300) };
  }
  return { name: "Error", message: String(error).slice(0, 300) };
}

export type FeedbackFormProps = {
  title?: string;
  placeholder?: string;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  location?: string;
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  submit?: WidgetSubmit<FormPayload>;
  /** A failure to attach to the report, such as a failed request. */
  error?: unknown;
  /** Fires two seconds after confirmation. Unmounting cancels the callback. */
  onDone?: () => void;
} & Pick<
  WidgetCallbacks<FormPayload>,
  "onStateChange" | "onSubmitStart" | "onSubmitSuccess" | "onSubmitError"
>;

export function FeedbackForm({
  title = "What happened?",
  placeholder = "Tell us what went wrong or what you expected…",
  submitLabel = "Send",
  thankYouMessage = "Got it. Sorry about that.",
  location = "/",
  disabled = false,
  className,
  style,
  submit,
  error,
  onDone,
  ...callbacks
}: FeedbackFormProps) {
  const attachedError = describeError(error);
  const machine = useFeedbackSubmission({ submit, ...callbacks });
  const [text, setText] = React.useState("");
  const [context, setContext] = React.useState<FeedbackContext>();
  const errorId = React.useId();
  const contextId = React.useId();
  React.useEffect(() => {
    setContext(collectFeedbackContext());
  }, []);
  useFeedbackDone(machine.state, onDone);
  const pending = disabled || machine.state === "submitting";
  return (
    <FeedbackFormCard
      state={machine.state}
      disabled={disabled}
      title={title}
      className={className}
      style={style}
    >
      {machine.state !== "done" ? (
        <FeedbackResponse sending={machine.state === "submitting"}>
          <FeedbackTextField
            attached
            label={title}
            placeholder={placeholder}
            text={text}
            setText={setText}
            disabled={pending}
            describedBy={[contextId, machine.submitError ? errorId : ""]
              .filter(Boolean)
              .join(" ")}
          />
          <p id={contextId} className={feedbackStyles.context}>
            {context
              ? `${context.route} · ${context.browser} · ${context.os} · ${context.viewport.width}×${context.viewport.height}`
              : "Page details are attached."}
            {attachedError ? ` · Error: ${attachedError.message}` : null}
          </p>
        </FeedbackResponse>
      ) : null}
      <FeedbackFormActions
        state={machine.state}
        submitError={machine.submitError}
        disabled={disabled}
        canSubmit={!!text.trim()}
        submitLabel={submitLabel}
        errorId={errorId}
        thankYouMessage={thankYouMessage}
        thankYouDescription="We read every message."
        onSubmit={() => {
          if (pending || !text.trim()) return;
          const currentContext = collectFeedbackContext();
          setContext(currentContext);
          void machine.submitPayload({
            widgetType: "form",
            location,
            text: text.trim(),
            ...(currentContext ? { context: currentContext } : {}),
            ...(attachedError ? { error: attachedError } : {}),
          });
        }}
      />
    </FeedbackFormCard>
  );
}
