"use client";

import * as React from "react";
import type {
  WidgetCallbacks,
  WidgetLayout,
  WidgetSubmit,
  WidgetType,
} from "../types";
import { cn } from "@workspace/ui/lib/utils";
import {
  FeedbackProvider,
  useFeedbackContext,
  type WidgetSize,
} from "./feedback-context";
import { Button } from "@workspace/ui/components/button";
import { X } from "lucide-react";
import {
  feedbackLayouts,
  feedbackSizes,
  feedbackTheme,
  feedbackStyles,
  type FeedbackStyle,
} from "../design-system";

export type FeedbackWidgetProps = {
  location?: string;
  widgetType: WidgetType;
  disabled?: boolean;
  size?: WidgetSize;
  closeButton?: boolean;
  className?: string;
  /** `stacked` (default) is the card; `inline` is a one-line bar. */
  layout?: WidgetLayout;
  style?: FeedbackStyle;
  doneDurationMs?: number;
  autoHide?: boolean;
  submit?: WidgetSubmit;
  children: React.ReactNode;
} & WidgetCallbacks;

function FeedbackWidgetInner({
  closeButton,
  className,
  style,
  children,
}: {
  closeButton?: boolean;
  className?: string;
  style?: FeedbackStyle;
  children: React.ReactNode;
}) {
  const {
    hidden,
    disabled,
    size,
    cancel,
    state,
    containerRef,
    focusAnchorRef,
    layout,
  } = useFeedbackContext();
  const inline = layout === "inline";

  if (hidden) {
    return (
      <span ref={focusAnchorRef} tabIndex={-1} className="sr-only">
        Feedback widget closed
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      data-slot="feedback-widget"
      data-layout={layout}
      data-state={state}
      className={cn(
        feedbackStyles.root,
        inline ? feedbackStyles.rootInline : feedbackStyles.rootStacked,
        feedbackTheme.className,
        className,
      )}
      style={{
        ...feedbackTheme.style,
        ...feedbackSizes[size],
        ...feedbackLayouts[layout],
        ...style,
      }}
      aria-disabled={disabled ? "true" : "false"}
      aria-busy={state === "submitting" ? "true" : undefined}
    >
      {closeButton ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={cancel}
          className={cn(
            feedbackStyles.close,
            inline && feedbackStyles.inlineClose,
            feedbackStyles.focus,
          )}
          aria-label="Dismiss feedback widget"
        >
          <X className={feedbackStyles.statusIcon} aria-hidden="true" />
        </Button>
      ) : null}
      <div
        className={cn(
          inline ? feedbackStyles.contentInline : feedbackStyles.content,
          closeButton &&
            (inline
              ? feedbackStyles.inlineCloseBar
              : feedbackStyles.closeHeader),
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function FeedbackWidget({
  location,
  widgetType,
  disabled,
  size,
  closeButton,
  className,
  layout = "stacked",
  style,
  doneDurationMs,
  autoHide,
  submit,
  children,
  ...callbacks
}: FeedbackWidgetProps) {
  return (
    <FeedbackProvider
      location={location}
      widgetType={widgetType}
      disabled={disabled}
      size={size}
      layout={layout}
      doneDurationMs={doneDurationMs}
      autoHide={autoHide}
      submit={submit}
      {...callbacks}
    >
      <FeedbackWidgetInner
        closeButton={closeButton}
        className={className}
        style={style}
      >
        {children}
      </FeedbackWidgetInner>
    </FeedbackProvider>
  );
}
