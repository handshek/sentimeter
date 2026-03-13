"use client";

import * as React from "react";
import {
  IconMoodAngry,
  IconMoodAngryFilled,
  IconMoodSad,
  IconMoodSadFilled,
  IconMoodNeutral,
  IconMoodNeutralFilled,
  IconMoodSmile,
  IconMoodSmileFilled,
  IconMoodHappy,
  IconMoodHappyFilled,
} from "@tabler/icons-react";
import type { WidgetCallbacks, WidgetPayload, WidgetSubmit } from "./types";
import { submitFeedback } from "./core/submit";
import { cx } from "./core/ui";
import { useWidgetMachine } from "./core/use-widget-machine";

export type EmojiFeedbackProps = {
  apiKey: string;
  location: string;
  disabled?: boolean;
  className?: string;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  doneDurationMs?: number;
  variant?: "emoji" | "tabler";
  submit?: WidgetSubmit;
} & WidgetCallbacks;

const DEFAULT_EMOJIS = ["😡", "🙁", "😐", "🙂", "😍"] as const;

const TABLER_SET = [
  { Outline: IconMoodAngry, Filled: IconMoodAngryFilled, label: "Angry" },
  { Outline: IconMoodSad, Filled: IconMoodSadFilled, label: "Sad" },
  {
    Outline: IconMoodNeutral,
    Filled: IconMoodNeutralFilled,
    label: "Neutral",
  },
  { Outline: IconMoodSmile, Filled: IconMoodSmileFilled, label: "Happy" },
  { Outline: IconMoodHappy, Filled: IconMoodHappyFilled, label: "Delighted" },
] as const;

export function EmojiFeedback({
  apiKey,
  location,
  disabled,
  className,
  submitLabel = "Submit",
  thankYouMessage = "Thanks!",
  doneDurationMs = 2000,
  variant = "emoji",
  submit = submitFeedback,
  onSelect,
  onStateChange,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
}: EmojiFeedbackProps) {
  const payloadBase = React.useMemo<Omit<WidgetPayload, "value">>(
    () => ({ apiKey, location, widgetType: "emoji" }),
    [apiKey, location],
  );

  const machine = useWidgetMachine({
    payloadBase,
    disabled,
    doneDurationMs,
    submit,
    onSelect,
    onStateChange,
    onSubmitStart,
    onSubmitSuccess,
    onSubmitError,
  });

  if (machine.hidden) return null;

  return (
    <div
      className={cx(
        "w-full max-w-sm rounded-xl border border-border/70 bg-background/60 p-3 shadow-sm backdrop-blur",
        className,
      )}
      aria-disabled={disabled ? "true" : "false"}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground">
          EMOJI FEEDBACK
        </div>
        <div
          className={cx(
            "text-[11px] font-medium",
            machine.state === "submitting"
              ? "text-muted-foreground"
              : machine.state === "done"
                ? "text-foreground"
                : "text-muted-foreground",
          )}
          aria-live="polite"
        >
          {machine.state === "submitting"
            ? "Submitting…"
            : machine.state === "done"
              ? "Submitted"
              : ""}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {variant === "emoji"
          ? DEFAULT_EMOJIS.map((emoji, idx) => {
              const value = idx + 1;
              const selected = machine.selectedValue === value;
              const label = `Rating ${value} of 5`;
              return (
                <button
                  key={emoji}
                  type="button"
                  disabled={disabled || machine.state === "submitting"}
                  onClick={() => machine.select(value)}
                  className={cx(
                    "relative grid h-10 place-items-center rounded-lg border text-xl transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    selected
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/70 hover:border-border",
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                  )}
                  aria-pressed={selected ? "true" : "false"}
                  aria-label={label}
                  title={label}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              );
            })
          : TABLER_SET.map(({ Outline, Filled, label }, idx) => {
              const value = idx + 1;
              const selected = machine.selectedValue === value;
              const Icon = selected ? Filled : Outline;
              const aria = `${label} (${value} of 5)`;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={disabled || machine.state === "submitting"}
                  onClick={() => machine.select(value)}
                  className={cx(
                    "relative grid h-10 place-items-center rounded-lg border transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                    selected
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/70 hover:border-border",
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer",
                  )}
                  aria-pressed={selected ? "true" : "false"}
                  aria-label={aria}
                  title={aria}
                >
                  <Icon
                    size={20}
                    className={cx(
                      "transition",
                      selected ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
      </div>

      {machine.state === "selected" || machine.state === "submitting" ? (
        <button
          type="button"
          disabled={disabled || machine.state === "submitting"}
          onClick={machine.submitSelected}
          className={cx(
            "mt-3 inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
            disabled
              ? "cursor-not-allowed opacity-60"
              : machine.state === "submitting"
                ? "cursor-wait opacity-80"
                : "hover:bg-primary/85",
          )}
        >
          {machine.state === "submitting" ? "Submitting…" : submitLabel}
        </button>
      ) : null}

      {machine.state === "done" ? (
        <div className="mt-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-foreground">
          {thankYouMessage}
        </div>
      ) : null}
    </div>
  );
}
