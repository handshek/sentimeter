"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import {
  feedbackSizes,
  feedbackStyles,
  feedbackTheme,
  type FeedbackStyle,
} from "../design-system";
import { notify } from "../core/use-feedback-submission";
import type { WidgetState, WidgetSubmitError } from "../types";

export function useFeedbackDone(state: WidgetState, onDone?: () => void) {
  const callbackRef = React.useRef(onDone);
  React.useEffect(() => {
    callbackRef.current = onDone;
  });
  React.useEffect(() => {
    if (state !== "done") return;
    const timer = setTimeout(() => notify(callbackRef.current), 2000);
    return () => clearTimeout(timer);
  }, [state]);
}

export function FeedbackFormCard({
  state,
  disabled,
  title,
  description,
  titleId,
  className,
  style,
  children,
}: {
  state: WidgetState;
  disabled?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  titleId?: string;
  className?: string;
  style?: FeedbackStyle;
  children: React.ReactNode;
}) {
  return (
    <div
      data-slot="feedback-widget"
      data-layout="stacked"
      data-state={state}
      aria-disabled={disabled || undefined}
      aria-busy={state === "submitting" || undefined}
      className={cn(
        feedbackStyles.root,
        feedbackStyles.rootStacked,
        feedbackTheme.className,
        className,
      )}
      style={{ ...feedbackTheme.style, ...feedbackSizes.default, ...style }}
    >
      <div className={feedbackStyles.content}>
        <div data-slot="feedback-header" className={feedbackStyles.header}>
          <h3
            id={titleId}
            data-slot="feedback-title"
            className={feedbackStyles.title}
          >
            {title}
          </h3>
          {description ? (
            <p className={feedbackStyles.description}>{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

export function FeedbackTextField({
  label,
  placeholder,
  text,
  setText,
  disabled,
  describedBy,
}: {
  label: string;
  placeholder: string;
  text: string;
  setText: (text: string) => void;
  disabled: boolean;
  describedBy?: string;
}) {
  const id = React.useId();
  return (
    <div data-slot="feedback-field" className={feedbackStyles.field}>
      <Label htmlFor={id} className={feedbackStyles.label}>
        {label}
      </Label>
      <Textarea
        id={id}
        aria-describedby={describedBy}
        className={feedbackStyles.input}
        rows={4}
        maxLength={500}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => {
          if (!disabled) setText(event.target.value);
        }}
      />
    </div>
  );
}

export function FeedbackFormActions({
  state,
  submitError,
  disabled,
  canSubmit,
  submitLabel,
  onSubmit,
  onSkip,
  errorId,
  thankYouMessage,
  thankYouDescription,
}: {
  state: WidgetState;
  submitError: WidgetSubmitError | null;
  disabled?: boolean;
  canSubmit: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onSkip?: () => void;
  errorId: string;
  thankYouMessage: React.ReactNode;
  thankYouDescription?: React.ReactNode;
}) {
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const successRef = React.useRef<HTMLDivElement>(null);
  const hadFocusRef = React.useRef(false);
  const [actionHeight, setActionHeight] = React.useState(0);
  React.useEffect(() => {
    if (
      state === "done" &&
      hadFocusRef.current &&
      document.activeElement === document.body
    )
      successRef.current?.focus();
  }, [state]);
  const actionStyle = actionHeight ? { minHeight: actionHeight } : undefined;
  if (state === "done")
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        data-slot="feedback-status"
        className={cn(
          feedbackStyles.success,
          thankYouDescription && feedbackStyles.formSuccess,
          feedbackStyles.focus,
        )}
        // A two-line thank-you keeps its own minimum; the measured button row
        // only stops the card from shrinking.
        style={
          actionHeight
            ? {
                minHeight: thankYouDescription
                  ? `max(7rem, ${actionHeight}px)`
                  : actionHeight,
              }
            : undefined
        }
      >
        <CheckCircle2
          className={feedbackStyles.statusIcon}
          aria-hidden="true"
        />
        <span>{thankYouMessage}</span>
        {thankYouDescription ? (
          <span className={feedbackStyles.description}>
            {thankYouDescription}
          </span>
        ) : null}
      </div>
    );
  const pending = disabled || state === "submitting";
  return (
    <div data-slot="feedback-footer" className={feedbackStyles.footer}>
      {state === "submitting" ? (
        <p role="status" className="sr-only">
          Submitting feedback
        </p>
      ) : null}
      {submitError ? (
        <p id={errorId} role="status" className={feedbackStyles.error}>
          <CircleAlert
            className={feedbackStyles.errorIcon}
            aria-hidden="true"
          />
          <span>{submitError.message}</span>
        </p>
      ) : null}
      <div
        ref={actionsRef}
        className={feedbackStyles.actions}
        style={actionStyle}
      >
        {onSkip ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => notify(onSkip)}
            className={cn(
              feedbackStyles.action,
              feedbackStyles.cancel,
              feedbackStyles.focus,
            )}
          >
            Skip
          </Button>
        ) : null}
        <Button
          type="button"
          disabled={pending || !canSubmit}
          aria-busy={state === "submitting" || undefined}
          className={cn(
            feedbackStyles.action,
            feedbackStyles.submit,
            feedbackStyles.focus,
          )}
          onClick={(event) => {
            hadFocusRef.current =
              document.activeElement === event.currentTarget;
            setActionHeight(actionsRef.current?.offsetHeight ?? 0);
            notify(onSubmit);
          }}
        >
          {state === "submitting" ? (
            <>
              <LoaderCircle
                className={cn(
                  feedbackStyles.statusIcon,
                  "animate-spin text-current motion-reduce:animate-none",
                )}
                aria-hidden="true"
              />
              Sending…
            </>
          ) : submitError ? (
            "Try again"
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}

export function FeedbackRadioGroup({
  options,
  value,
  selectOption,
  disabled,
  labelledBy,
}: {
  options: readonly { label: string; value: string }[];
  value: string | null;
  selectOption: (value: string) => void;
  disabled: boolean;
  labelledBy: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className={feedbackStyles.surveyOptions}
    >
      {options.map((option, index) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          tabIndex={
            value === option.value || (value === null && index === 0) ? 0 : -1
          }
          className={cn(
            feedbackStyles.surveyOption,
            feedbackStyles.focus,
            value === option.value && feedbackStyles.selected,
            value === option.value && feedbackStyles.submittedChoice,
          )}
          onClick={() => selectOption(option.value)}
          onKeyDown={(event) => {
            if (disabled) return;
            let next: number;
            switch (event.key) {
              case "ArrowDown":
              case "ArrowRight":
                next = (index + 1) % options.length;
                break;
              case "ArrowUp":
              case "ArrowLeft":
                next = (index - 1 + options.length) % options.length;
                break;
              case "Home":
                next = 0;
                break;
              case "End":
                next = options.length - 1;
                break;
              default:
                return;
            }
            event.preventDefault();
            const nextOption = options[next];
            if (!nextOption) return;
            selectOption(nextOption.value);
            event.currentTarget.parentElement
              ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
              [next]?.focus();
          }}
        >
          <span
            aria-hidden="true"
            className={cn(
              feedbackStyles.surveyRadio,
              value === option.value && feedbackStyles.surveyRadioSelected,
            )}
          />
          <span className="min-w-0">{option.label}</span>
        </Button>
      ))}
    </div>
  );
}
