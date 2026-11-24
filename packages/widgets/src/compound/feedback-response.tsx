"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { feedbackStyles } from "../design-system";
import { useOptionalFeedbackContext } from "./feedback-context";

export type FeedbackResponseProps = {
  /** Dims the group while a typed answer sends. Ratings set it themselves. */
  sending?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** The outline that groups the rating with its optional note. */
export function FeedbackResponse({
  sending,
  className,
  children,
}: FeedbackResponseProps) {
  const ctx = useOptionalFeedbackContext();
  return (
    <div
      data-slot="feedback-response"
      data-sending={
        sending ?? (ctx?.state === "submitting" && ctx.showFollowUp)
      }
      className={cn(feedbackStyles.response, className)}
    >
      {children}
    </div>
  );
}
