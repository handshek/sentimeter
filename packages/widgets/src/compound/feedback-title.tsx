"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { feedbackStyles } from "../design-system";
import { useFeedbackContext } from "./feedback-context";

export type FeedbackTitleProps = {
  className?: string;
  children: React.ReactNode;
};

export function FeedbackTitle({ className, children }: FeedbackTitleProps) {
  const { layout } = useFeedbackContext();
  return (
    <h3
      data-slot="feedback-title"
      className={cn(
        feedbackStyles.title,
        layout === "inline" && feedbackStyles.titleInline,
        className,
      )}
    >
      {children}
    </h3>
  );
}
