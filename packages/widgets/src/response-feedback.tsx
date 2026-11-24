"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { CircleAlert, LoaderCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import {
  FeedbackResponse,
  FeedbackTextField,
  feedbackStyles,
  feedbackTheme,
  feedbackSizes,
  useFeedbackSubmission,
  type FeedbackStyle,
  type ResponsePayload,
  type WidgetCallbacks,
  type WidgetSubmit,
} from "./feedback-system";

const DEFAULT_REASONS = [
  "Not accurate",
  "Didn't follow instructions",
  "Too long",
  "Unsafe",
  "Other",
] as const;

export type ResponseFeedbackProps = {
  /** The host's id for the answer, sent with the vote. */
  responseId?: string;
  location?: string;
  /** Reasons offered after a bad vote. */
  reasons?: readonly string[];
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  submit?: WidgetSubmit<ResponsePayload>;
} & Pick<
  WidgetCallbacks<ResponsePayload>,
  "onStateChange" | "onSubmitStart" | "onSubmitSuccess" | "onSubmitError"
>;

/**
 * Two thumbs under an AI or chat answer. Good sends at once; Bad asks why.
 * The vote is final, so only the chosen thumb stays. The host keeps its own
 * Copy and Regenerate buttons.
 */
export function ResponseFeedback({
  responseId,
  location = "/",
  reasons = DEFAULT_REASONS,
  disabled = false,
  className,
  style,
  submit,
  ...callbacks
}: ResponseFeedbackProps) {
  const machine = useFeedbackSubmission({ submit, ...callbacks });
  const [vote, setVote] = React.useState<0 | 1 | null>(null);
  const [reason, setReason] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");
  const titleId = React.useId();
  const errorId = React.useId();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const done = machine.state === "done";
  const sending = machine.state === "submitting";
  const asking = vote === 0 && !done;

  React.useEffect(() => {
    if (asking)
      panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [asking]);

  const send = (value: 0 | 1) => {
    void machine.submitPayload({
      location,
      widgetType: "response",
      value,
      ...(responseId ? { responseId } : {}),
      ...(value === 0 && reason ? { reason } : {}),
      ...(value === 0 && text.trim() ? { text: text.trim() } : {}),
    });
  };

  const thumb = (value: 0 | 1) => {
    const picked = vote === value;
    const Icon = value === 1 ? ThumbsUp : ThumbsDown;
    const label = value === 1 ? "Good response" : "Bad response";
    if (done && !picked) return null;
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        title={label}
        aria-pressed={picked}
        disabled={disabled || sending || done}
        data-slot="feedback-choice"
        data-state={picked ? "selected" : "idle"}
        onClick={() => {
          if (vote === value && !machine.submitError) return;
          machine.clearError();
          setVote(value);
          if (value === 1) {
            setReason(null);
            setText("");
            machine.setStateSafe("selected");
            send(1);
          } else {
            machine.setStateSafe("selected");
          }
        }}
        className={cn(
          feedbackStyles.responseThumb,
          feedbackStyles.focus,
          picked && feedbackStyles.responseThumbPicked,
        )}
      >
        {picked && sending && value === 1 ? (
          <LoaderCircle
            aria-hidden="true"
            className={cn(feedbackStyles.choiceSpinner, "size-4")}
          />
        ) : (
          <Icon
            aria-hidden="true"
            className={cn("size-4", picked && "fill-current")}
          />
        )}
      </Button>
    );
  };

  return (
    <div
      data-slot="feedback-widget"
      data-layout="response"
      data-state={machine.state}
      aria-busy={sending || undefined}
      className={cn(
        feedbackTheme.className,
        feedbackStyles.responseRoot,
        className,
      )}
      style={{ ...feedbackTheme.style, ...feedbackSizes.default, ...style }}
    >
      <div
        role="group"
        aria-label="Rate this response"
        className="flex items-center gap-0.5"
      >
        {thumb(1)}
        {thumb(0)}
        {done ? (
          <span role="status" className={feedbackStyles.responseThanks}>
            Thanks for the feedback
          </span>
        ) : null}
        {vote === 1 && machine.submitError ? (
          <p role="status" className={cn(feedbackStyles.error, "ms-1")}>
            <CircleAlert
              className={feedbackStyles.errorIcon}
              aria-hidden="true"
            />
            <span>Couldn&apos;t send. Pick again to retry.</span>
          </p>
        ) : null}
      </div>
      {asking ? (
        <div
          ref={panelRef}
          role="group"
          aria-labelledby={titleId}
          data-slot="feedback-response-panel"
          className={feedbackStyles.responsePanel}
        >
          <p id={titleId} className={feedbackStyles.thanksTitle}>
            What went wrong?
          </p>
          <FeedbackResponse sending={sending}>
            <div
              role="radiogroup"
              aria-labelledby={titleId}
              className={feedbackStyles.chips}
            >
              {reasons.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant="outline"
                  role="radio"
                  aria-checked={reason === option}
                  disabled={disabled || sending}
                  onClick={() => setReason(reason === option ? null : option)}
                  className={cn(
                    feedbackStyles.chip,
                    feedbackStyles.focus,
                    reason === option && feedbackStyles.selected,
                  )}
                >
                  {option}
                </Button>
              ))}
            </div>
            <FeedbackTextField
              attached
              label="Tell us more"
              placeholder="Tell us more (optional)"
              text={text}
              setText={setText}
              disabled={disabled || sending}
              describedBy={machine.submitError ? errorId : undefined}
            />
          </FeedbackResponse>
          <div className={feedbackStyles.actions}>
            <Button
              type="button"
              variant="outline"
              disabled={disabled || sending}
              onClick={() => {
                setVote(null);
                setReason(null);
                setText("");
                machine.clearError();
                machine.setStateSafe("idle");
              }}
              className={cn(
                feedbackStyles.action,
                feedbackStyles.cancel,
                feedbackStyles.focus,
              )}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={disabled || sending || (!reason && !text.trim())}
              aria-busy={sending || undefined}
              onClick={() => send(0)}
              className={cn(
                feedbackStyles.action,
                feedbackStyles.submit,
                feedbackStyles.focus,
              )}
            >
              {sending ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin motion-reduce:animate-none"
                  />
                  Sending…
                </>
              ) : machine.submitError ? (
                "Try again"
              ) : (
                "Send"
              )}
            </Button>
          </div>
          {machine.submitError ? (
            <p id={errorId} role="status" className={feedbackStyles.error}>
              <CircleAlert
                className={feedbackStyles.errorIcon}
                aria-hidden="true"
              />
              <span>{machine.submitError.message}</span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
