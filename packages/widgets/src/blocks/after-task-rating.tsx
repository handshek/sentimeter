"use client";

import { CircleCheck } from "lucide-react";
import { EmojiFeedback, type EmojiFeedbackProps } from "../emoji-feedback";

export type AfterTaskRatingProps = Pick<
  EmojiFeedbackProps,
  "submit" | "location"
> & {
  done?: string;
  question?: string;
};

export function AfterTaskRating({
  submit,
  location = "after-task",
  done = "Order placed",
  question = "How was checkout?",
}: AfterTaskRatingProps) {
  return (
    <section className="flex w-full max-w-sm flex-col gap-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CircleCheck aria-hidden="true" className="size-4 text-primary" />
        {done}
      </p>
      <EmojiFeedback title={question} submit={submit} location={location} />
    </section>
  );
}
