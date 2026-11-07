"use client";

import * as React from "react";
import {
  collectFeedbackContext,
  FeedbackFormActions,
  FeedbackFormCard,
  FeedbackTextField,
  feedbackStyles,
  useFeedbackDone,
  useFeedbackSubmission,
  type FeedbackContext,
  type FeedbackStyle,
  type WidgetCallbacks,
  type WidgetSubmit,
} from "./feedback-system";

export type FeedbackFormProps = {
  title?: string;
  placeholder?: string;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  location?: string;
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  submit?: WidgetSubmit;
  /** Fires two seconds after confirmation. Unmounting cancels the callback. */
  onDone?: () => void;
} & Pick<
  WidgetCallbacks,
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
  onDone,
  ...callbacks
}: FeedbackFormProps) {
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
        <>
          <FeedbackTextField
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
          </p>
        </>
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
          });
        }}
      />
    </FeedbackFormCard>
  );
}
