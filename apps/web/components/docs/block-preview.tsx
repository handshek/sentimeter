"use client";

import { useState } from "react";
import { Monitor, RotateCcw, Smartphone } from "lucide-react";
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
          {/* An iframe gives the block its own viewport, so phone width runs
              the phone layout and dialogs stay inside the preview. */}
          <iframe
            key={run}
            src={`/block-frame/${slug}`}
            title={`${title} preview`}
            className={cn(
              "h-[38rem] w-full rounded-lg border bg-background",
              device === "phone" && "max-w-[390px]",
            )}
          />
        </div>
      </TabsContent>
      <TabsContent value="code" className="m-0">
        <CodeBlock code={usage} label="Usage" />
      </TabsContent>
    </Tabs>
  );
}
