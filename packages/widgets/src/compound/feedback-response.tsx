"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { feedbackStyles } from "../design-system";
import { useOptionalFeedbackContext } from "./feedback-context";

export type FeedbackResponseProps = {
  className?: string;
  children: React.ReactNode;
};

/** The outline that groups the rating with its optional note. */
export function FeedbackResponse({
  className,
  children,
}: FeedbackResponseProps) {
  const ctx = useOptionalFeedbackContext();
  return (
    <div
      data-slot="feedback-response"
      data-sending={ctx?.state === "submitting" && ctx.showFollowUp}
      className={cn(feedbackStyles.response, className)}
    >
      {children}
    </div>
  );
}
