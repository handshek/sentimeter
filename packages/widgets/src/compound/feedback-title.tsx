"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type FeedbackTitleProps = {
  className?: string;
  children: React.ReactNode;
};

export function FeedbackTitle({ className, children }: FeedbackTitleProps) {
  return (
    <h3 className={cn("text-base font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}
