"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { feedbackStyles } from "../design-system";

export type FeedbackResponseProps = {
  className?: string;
  children: React.ReactNode;
};

/** The recessed well that groups the rating with its optional comment. */
export function FeedbackResponse({
  className,
  children,
}: FeedbackResponseProps) {
  return (
    <div
      data-slot="feedback-response"
      className={cn(feedbackStyles.response, className)}
    >
      {children}
    </div>
  );
}
