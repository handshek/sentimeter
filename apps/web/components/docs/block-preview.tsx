"use client";

import { useState, type ReactNode } from "react";
import { Monitor, RotateCcw, Smartphone } from "lucide-react";
import {
  AfterTaskRating,
  CancelFlowSurvey,
  ErrorFeedback,
  FloatingFeedback,
  ReportProblem,
  WasThisHelpful,
} from "@workspace/widgets";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";
import type { BlockSlug } from "@/lib/block-catalog";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";

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

export function BlockPreview({
  slug,
  title,
  installCommand,
  usage,
}: {
  slug: BlockSlug;
  title: string;
  installCommand: string;
  usage: string;
}) {
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [run, setRun] = useState(0);
  const Stage = stages[slug];
  return (
    <Tabs
      defaultValue="preview"
      className="gap-0 overflow-hidden rounded-xl border"
    >
      <div className="flex flex-wrap items-center gap-2 border-b bg-card p-2">
        <TabsList aria-label={`${title} example`}>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-1">
          <div role="group" aria-label="Preview width" className="flex">
            {(
              [
                ["desktop", Monitor, "Desktop width"],
                ["phone", Smartphone, "Phone width"],
              ] as const
            ).map(([value, Icon, label]) => (
              <Button
                key={value}
                type="button"
                variant="ghost"
                size="icon"
                aria-label={label}
                aria-pressed={device === value}
                className={cn(device === value && "bg-accent")}
                onClick={() => setDevice(value)}
              >
                <Icon aria-hidden="true" className="size-4" />
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Reload example"
            onClick={() => setRun((value) => value + 1)}
          >
            <RotateCcw aria-hidden="true" className="size-4" />
          </Button>
          <CopyButton
            text={installCommand}
            label="Copy install"
            className="max-sm:hidden"
          />
        </div>
      </div>
      <TabsContent value="preview" className="m-0">
        <div className="flex justify-center bg-muted/40 p-4">
          {/* The transform makes this frame the containing block, so a
              fixed-position block stays inside the preview. */}
          <div
            key={run}
            className={cn(
              "relative h-[38rem] w-full overflow-y-auto rounded-lg border bg-background transform-gpu",
              device === "phone" ? "max-w-sm" : "max-w-none",
            )}
          >
            <Stage />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="code" className="m-0">
        <CodeBlock code={usage} label="Usage" />
      </TabsContent>
    </Tabs>
  );
}
