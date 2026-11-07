"use client";

import type { ReactNode } from "react";
import {
  AfterTaskRating,
  CancelFlowSurvey,
  ErrorFeedback,
  FloatingFeedback,
  ReportProblem,
  WasThisHelpful,
} from "@workspace/widgets";
import { cn } from "@workspace/ui/lib/utils";
import type { BlockSlug } from "@/lib/block-catalog";

function Lines({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {widths.map((width) => (
        <span key={width} className={cn("h-2 rounded-full bg-muted", width)} />
      ))}
    </div>
  );
}

function AppFrame({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-5">
        <span className="ds-label">Acme</span>
        <span className="size-7 rounded-full bg-muted" />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <p className="ds-title">{title}</p>
        {children}
      </div>
    </div>
  );
}

const noop = async () => {};

const stages: Record<BlockSlug, () => ReactNode> = {
  "floating-feedback": () => (
    <AppFrame title="Billing">
      <Lines widths={["w-2/5", "w-4/5", "w-3/5"]} />
      <FloatingFeedback />
    </AppFrame>
  ),
  "report-problem": () => (
    <div className="flex h-full flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <span className="ds-label px-2">Acme</span>
        <ReportProblem />
      </div>
      <div className="p-6">
        <Lines widths={["w-2/5", "w-4/5", "w-3/5"]} />
      </div>
    </div>
  ),
  "error-feedback": () => (
    <ErrorFeedback
      error={Object.assign(new Error("Preview"), { digest: "preview" })}
      reset={() => {}}
    />
  ),
  "was-this-helpful": () => (
    <div className="mx-auto w-full max-w-xl p-8">
      <p className="ds-title">Connect your backend</p>
      <div className="mt-4">
        <Lines widths={["w-full", "w-11/12", "w-4/5", "w-3/5"]} />
      </div>
      <WasThisHelpful />
    </div>
  ),
  "after-task-rating": () => (
    <div className="flex h-full items-center justify-center p-6">
      <AfterTaskRating />
    </div>
  ),
  "cancel-flow-survey": () => (
    <AppFrame title="Billing">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="ds-label">Pro plan</p>
          <p className="ds-body-sm text-muted-foreground">Renews 30 Nov</p>
        </div>
        <CancelFlowSurvey cancelPlan={noop} endsOn="30 Nov" />
      </div>
    </AppFrame>
  ),
};

/** One block in a mock app, rendered alone inside the block page's iframe. */
export function BlockStage({ slug }: { slug: BlockSlug }) {
  const Stage = stages[slug];
  return <Stage />;
}
