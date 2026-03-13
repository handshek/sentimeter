"use client";

import * as React from "react";
import { IconStar, IconStarFilled } from "@tabler/icons-react";
import type { WidgetCallbacks, WidgetPayload, WidgetSubmit } from "./types";
import { submitFeedback } from "./core/submit";
import { cx } from "./core/ui";
import { useWidgetMachine } from "./core/use-widget-machine";

export type StarRatingProps = {
  apiKey: string;
  location: string;
  disabled?: boolean;
  className?: string;
  submitLabel?: string;
  thankYouMessage?: React.ReactNode;
  doneDurationMs?: number;
  submit?: WidgetSubmit;
} & WidgetCallbacks;

export function StarRating({
  apiKey,
  location,
  disabled,
  className,
  submitLabel = "Submit",
  thankYouMessage = "Thanks!",
  doneDurationMs = 2000,
  submit = submitFeedback,
  onSelect,
  onStateChange,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
}: StarRatingProps) {
  const payloadBase = React.useMemo<Omit<WidgetPayload, "value">>(
    () => ({ apiKey, location, widgetType: "star" }),
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

  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (machine.state !== "selected") return;
    // keep hover independent; no-op
  }, [machine.state]);

  if (machine.hidden) return null;

  const previewValue = hoverValue ?? machine.selectedValue ?? 0;

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
          STARS
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

      <div className="mt-3 flex items-center justify-between gap-1">
        {Array.from({ length: 5 }).map((_, idx) => {
          const value = idx + 1;
          const filled = value <= previewValue;
          const selected = machine.selectedValue === value;
          const label = `Rate ${value} star${value === 1 ? "" : "s"}`;
          const Icon = filled ? IconStarFilled : IconStar;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled || machine.state === "submitting"}
              onMouseEnter={() => setHoverValue(value)}
              onMouseLeave={() => setHoverValue(null)}
              onFocus={() => setHoverValue(value)}
              onBlur={() => setHoverValue(null)}
              onClick={() => machine.select(value)}
              className={cx(
                "grid size-10 place-items-center rounded-lg border transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                selected
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/70 hover:border-border",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
              aria-pressed={selected ? "true" : "false"}
              aria-label={label}
              title={label}
            >
              <Icon
                size={20}
                className={cx(
                  "transition",
                  filled ? "text-primary" : "text-muted-foreground",
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
