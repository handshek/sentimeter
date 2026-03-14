"use client";

import * as React from "react";
import type { WidgetCallbacks, WidgetSubmit, WidgetType } from "../types";
import { cx } from "../core/ui";
import {
  FeedbackProvider,
  useFeedbackContext,
  type WidgetSize,
} from "./feedback-context";
import { Button } from "@workspace/ui/components/button";
import { IconX } from "@tabler/icons-react";

export type FeedbackWidgetProps = {
  apiKey: string;
  location: string;
  widgetType: WidgetType;
  disabled?: boolean;
  size?: WidgetSize;
  closeButton?: boolean;
  className?: string;
  doneDurationMs?: number;
  submit?: WidgetSubmit;
  children: React.ReactNode;
} & WidgetCallbacks;

const CONTAINER_SIZE_MAP: Record<WidgetSize, string> = {
  sm: "max-w-[360px] p-5",
  default: "max-w-[400px] p-6",
  md: "max-w-[440px] p-7",
  lg: "max-w-[480px] p-8",
};

function FeedbackWidgetInner({
  closeButton,
  className,
  children,
}: {
  closeButton?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { hidden, disabled, size, cancel } = useFeedbackContext();

  if (hidden) return null;

  return (
    <div
      className={cx(
        "relative w-full rounded-3xl border border-border/60 bg-background shadow-xl",
        CONTAINER_SIZE_MAP[size],
        className,
      )}
      aria-disabled={disabled ? "true" : "false"}
    >
      {closeButton ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={cancel}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss feedback widget"
        >
          <IconX size={16} aria-hidden="true" />
        </Button>
      ) : null}
      {children}
    </div>
  );
}

export function FeedbackWidget({
  apiKey,
  location,
  widgetType,
  disabled,
  size,
  closeButton,
  className,
  doneDurationMs,
  submit,
  children,
  ...callbacks
}: FeedbackWidgetProps) {
  return (
    <FeedbackProvider
      apiKey={apiKey}
      location={location}
      widgetType={widgetType}
      disabled={disabled}
      size={size}
      doneDurationMs={doneDurationMs}
      submit={submit}
      {...callbacks}
    >
      <FeedbackWidgetInner closeButton={closeButton} className={className}>
        {children}
      </FeedbackWidgetInner>
    </FeedbackProvider>
  );
}
