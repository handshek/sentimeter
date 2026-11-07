"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Survey, type SurveyProps } from "../survey";

export type CancelFlowSurveyProps = Pick<SurveyProps, "submit" | "location"> & {
  /** Runs your real cancellation after the reason is sent, or on Skip. */
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Cancel plan</Button>
      </DialogTrigger>
      <DialogContent className="gap-4 sm:max-w-sm" showCloseButton={false}>
        <div className="flex flex-col gap-1.5">
          <DialogTitle>Cancel your {planName} plan?</DialogTitle>
          <DialogDescription>
            {endsOn
              ? `You’ll keep ${planName} until ${endsOn}.`
              : `You’ll keep ${planName} until the end of this billing period.`}
          </DialogDescription>
        </div>
        {/* Sending the reason and cancelling happen in one step, so a failed
            cancellation keeps the reason for retry. */}
        <Survey
          location={location}
          submitLabel="Cancel plan"
          skipLabel="Skip and cancel"
          thankYouMessage="Your plan is cancelled. Thanks for telling us."
          className="max-w-none shadow-none"
          submit={async (payload) => {
            await submit?.(payload);
            await cancelPlan();
          }}
          onSkip={async () => {
            // A failed cancellation keeps the dialog open so the user can retry.
            await cancelPlan();
            setOpen(false);
          }}
          onDone={() => setOpen(false)}
        />
        <DialogClose asChild>
          <Button variant="ghost">Keep my plan</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
