"use client";

import type { ReactNode } from "react";
import {
  CircleAlert,
  CircleCheck,
  MessageSquareText,
  TriangleAlert,
} from "lucide-react";
import {
  EmojiFeedback,
  FeedbackForm,
  LikeDislike,
  NpsScore,
  StarRating,
  Survey,
} from "@workspace/widgets";
import { cn } from "@workspace/ui/lib/utils";
import type { PreviewId } from "@/lib/directory";

const twoReasons = [
  { label: "Too expensive", value: "too-expensive" },
  { label: "Something didn’t work", value: "not-working" },
];

function Lines({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {widths.map((width) => (
        <span key={width} className={cn("h-2 rounded-full bg-muted", width)} />
      ))}
    </div>
  );
}

function MiniApp({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-60 w-full overflow-hidden rounded-xl border bg-background p-5 text-left">
      {children}
    </div>
  );
}

function Pill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "ds-label inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 shadow-md",
        className,
      )}
    >
      <MessageSquareText aria-hidden="true" className="size-4" />
      Feedback
    </span>
  );
}

const previews: Record<PreviewId, { scale: string; node: ReactNode }> = {
  form: { scale: "scale-[0.55]", node: <FeedbackForm /> },
  emoji: {
    scale: "scale-[0.58]",
    node: <EmojiFeedback title="How was checkout?" />,
  },
  thumbs: {
    scale: "scale-[0.72]",
    node: <LikeDislike layout="inline" title="Was this helpful?" />,
  },
  star: {
    scale: "scale-[0.58]",
    node: <StarRating title="Rate your onboarding" />,
  },
  nps: {
    scale: "scale-[0.58]",
    node: <NpsScore title="Recommend us to a friend?" />,
  },
  survey: {
    scale: "scale-[0.5]",
    node: (
      <Survey options={[...twoReasons, { label: "Other", value: "other" }]} />
    ),
  },
  "floating-feedback": {
    scale: "scale-[0.56]",
    node: (
      <MiniApp>
        <p className="ds-title">Billing</p>
        <div className="mt-3">
          <Lines widths={["w-40", "w-64", "w-52"]} />
        </div>
        <p className="ds-body-sm mt-5 flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <CircleAlert aria-hidden="true" className="size-4 text-destructive" />
          Couldn’t save changes.
        </p>
        <Pill className="absolute right-4 bottom-4" />
      </MiniApp>
    ),
  },
  "report-problem": {
    scale: "scale-[0.56]",
    node: (
      <MiniApp>
        <div className="flex items-center justify-between">
          <p className="ds-label">Acme</p>
          <span className="size-7 rounded-full bg-muted" />
        </div>
        <div className="absolute top-14 right-5 w-52 rounded-lg border bg-card p-1 shadow-md">
          {["Account", "Billing", "Report a problem", "Sign out"].map(
            (item) => (
              <p
                key={item}
                className={cn(
                  "ds-body-sm rounded-md px-3 py-2 text-muted-foreground",
                  item === "Report a problem" &&
                    "bg-accent font-medium text-foreground",
                )}
              >
                {item}
              </p>
            ),
          )}
        </div>
      </MiniApp>
    ),
  },
  "error-feedback": {
    scale: "scale-[0.58]",
    node: (
      <div className="flex w-80 flex-col items-center gap-2 text-center">
        <TriangleAlert
          aria-hidden="true"
          className="size-5 text-muted-foreground"
        />
        <p className="ds-title">Something broke on our side.</p>
        <p className="ds-body-sm text-muted-foreground">
          What were you trying to do?
        </p>
        <div className="mt-2 flex w-full items-center gap-2">
          <span className="ds-body-sm flex-1 rounded-lg border bg-card px-3 py-2 text-left text-muted-foreground">
            I was exporting my invoices…
          </span>
          <span className="ds-label rounded-lg bg-primary px-3 py-2 text-primary-foreground">
            Send
          </span>
        </div>
      </div>
    ),
  },
  "was-this-helpful": {
    scale: "scale-[0.55]",
    node: (
      <div className="flex w-full flex-col gap-4 text-left">
        <p className="ds-label">Connect your backend</p>
        <Lines widths={["w-full", "w-11/12", "w-3/5"]} />
        <LikeDislike layout="inline" title="Was this helpful?" />
      </div>
    ),
  },
  "after-task-rating": {
    scale: "scale-[0.54]",
    node: (
      <div className="flex w-full flex-col gap-3 text-left">
        <p className="ds-label flex items-center gap-2">
          <CircleCheck aria-hidden="true" className="size-4 text-primary" />
          Order placed
        </p>
        <EmojiFeedback title="How was checkout?" />
      </div>
    ),
  },
  "cancel-flow-survey": {
    scale: "scale-[0.5]",
    node: (
      <Survey
        title="Cancel your Pro plan?"
        description="You’ll keep Pro until 30 Nov."
        options={twoReasons}
        submitLabel="Cancel plan"
        skipLabel="Keep my plan"
        onSkip={() => {}}
      />
    ),
  },
};

/** A still, scaled render of the real component, sized to sit inside a card. */
export function CardPreview({ id }: { id: PreviewId }) {
  const { scale, node } = previews[id];
  return (
    <div
      aria-hidden="true"
      inert
      className="pointer-events-none flex h-full w-full items-center justify-center overflow-hidden select-none"
    >
      <div
        className={cn("flex w-96 shrink-0 origin-center justify-center", scale)}
      >
        {node}
      </div>
    </div>
  );
}
