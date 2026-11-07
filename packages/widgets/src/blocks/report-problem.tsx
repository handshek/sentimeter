"use client";

import * as React from "react";
import { MessageSquareWarning } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { FeedbackForm, type FeedbackFormProps } from "../feedback-form";

export type ReportProblemProps = Pick<
  FeedbackFormProps,
  "submit" | "location"
> & {
  label?: string;
};

export function ReportProblem({
  submit,
  location = "report-problem",
  label = "Report a problem",
}: ReportProblemProps) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <MessageSquareWarning aria-hidden="true" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="gap-0 bg-transparent p-0 ring-0 sm:max-w-sm"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{label}</DialogTitle>
        <FeedbackForm
          submit={submit}
          location={location}
          onDone={() => setOpen(false)}
          className="max-w-none"
        />
      </DialogContent>
    </Dialog>
  );
}
