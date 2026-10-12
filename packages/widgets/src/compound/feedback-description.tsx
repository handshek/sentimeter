"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";
import { feedbackStyles } from "../design-system";

export type FeedbackDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

export function FeedbackDescription({
  className,
  children,
}: FeedbackDescriptionProps) {
  return (
    <p
      data-slot="feedback-description"
      className={cn(feedbackStyles.description, className)}
    >
      {children}
    </p>
  );
}
