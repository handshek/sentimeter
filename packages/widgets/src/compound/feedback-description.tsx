"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export type FeedbackDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

export function FeedbackDescription({
  className,
  children,
}: FeedbackDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}
