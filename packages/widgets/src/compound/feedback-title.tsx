"use client";

import * as React from "react";
import { cx } from "../core/ui";

export type FeedbackTitleProps = {
  className?: string;
  children: React.ReactNode;
};

export function FeedbackTitle({ className, children }: FeedbackTitleProps) {
  return (
    <h3 className={cx("text-base font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}
