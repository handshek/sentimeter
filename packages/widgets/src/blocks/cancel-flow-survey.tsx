"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Survey, type SurveyProps } from "../survey";

export type CancelFlowSurveyProps = Pick<SurveyProps, "submit" | "location"> & {
  /** Runs your real cancellation after the reason is sent. */
  cancelPlan: () => void | Promise<void>;
  planName?: string;
  endsOn?: string;
};

export function CancelFlowSurvey({
  submit,
  cancelPlan,
  location = "cancel-flow",
  planName = "Pro",
  endsOn,
}: CancelFlowSurveyProps) {
  const [open, setOpen] = React.useState(false);
  const title = `Cancel your ${planName} plan?`;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Cancel plan</Button>
      </DialogTrigger>
      <DialogContent
        className="gap-0 bg-transparent p-0 ring-0 sm:max-w-sm"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Sending the reason and cancelling happen in one step, so a failed
            cancellation keeps the reason for retry. */}
        <Survey
          title={title}
          description={`You’ll keep ${planName} until ${endsOn ?? "the end of this billing period"}. Before you go, why are you leaving?`}
          location={location}
          submitLabel="Cancel plan"
          skipLabel="Keep my plan"
          thankYouMessage="Your plan is cancelled. Thanks for telling us."
          className="max-w-none"
          submit={async (payload) => {
            await submit?.(payload);
            await cancelPlan();
          }}
          onSkip={() => setOpen(false)}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
