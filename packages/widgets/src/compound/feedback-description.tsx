"use client";

import * as React from "react";
import { cx } from "../core/ui";

export type FeedbackDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

export function FeedbackDescription({
  className,
  children,
}: FeedbackDescriptionProps) {
  return (
    <p className={cx("text-sm text-muted-foreground", className)}>{children}</p>
  );
}
