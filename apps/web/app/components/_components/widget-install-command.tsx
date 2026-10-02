"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Terminal } from "lucide-react";
import { CopyButton } from "./copy-button";
import {
  getInstallCommands,
  packageManagers,
  type PackageManager,
  type WidgetInstallMetadata,
} from "../../_lib/widget-catalog";

export type {
  PackageManager,
  WidgetInstallMetadata,
} from "../../_lib/widget-catalog";

type WidgetInstallCommandProps = {
  registryName: string;
  defaultManager?: PackageManager;
  metadata?: WidgetInstallMetadata;
};

function formatDependency(name: string) {
  if (name === "button") return "Button";
  if (name === "textarea") return "Textarea";
  return name;
}

export function WidgetInstallCommand({
  registryName,
  defaultManager = "bun",
  metadata,
}: WidgetInstallCommandProps) {
  const [manager, setManager] = React.useState<PackageManager>(defaultManager);
  const commands = React.useMemo(
    () => getInstallCommands(registryName),
    [registryName],
  );
  const activeCommand = commands[manager];

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border bg-zinc-950 text-zinc-100 shadow-sm">
        <Tabs
          value={manager}
          onValueChange={(value) => setManager(value as PackageManager)}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
            <Terminal
              className="hidden size-4 shrink-0 text-zinc-500 sm:block"
              aria-hidden="true"
            />
            <TabsList className="h-auto max-w-full bg-transparent p-0 group-data-horizontal/tabs:h-auto">
              {packageManagers.map((packageManager) => (
                <TabsTrigger
                  key={packageManager}
                  value={packageManager}
                  className="h-11 min-w-11 px-2 py-1 font-mono text-xs text-zinc-400 hover:text-zinc-100 data-active:bg-zinc-900 data-active:text-zinc-100 sm:px-3"
                  translate="no"
                >
                  {packageManager}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="ml-auto min-w-0">
              <CopyButton
                key={activeCommand}
                text={activeCommand}
                label="Copy Command"
                className="h-11 text-zinc-300 hover:bg-white/10 hover:text-white"
              />
            </div>
          </div>

          {packageManagers.map((packageManager) => (
            <TabsContent
              key={packageManager}
              value={packageManager}
              className="m-0"
            >
              <code
                className="block whitespace-pre-wrap break-all px-4 py-3 font-mono text-[13px] text-zinc-300"
                translate="no"
              >
                {commands[packageManager]}
              </code>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {metadata ? (
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-card-foreground">
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              {metadata.targetFiles.length} Sentimeter Files
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              {metadata.widgetFileCount} widget wrapper +{" "}
              {metadata.sharedFileCount} shared feedback-system files
            </p>
          </div>

          <Accordion type="single" collapsible className="mt-1">
            <AccordionItem value="installed-files" className="border-0">
              <AccordionTrigger className="min-h-11 py-2 text-xs">
                View Exact File Paths
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <ul className="space-y-1.5">
                  {metadata.targetFiles.map((targetFile) => (
                    <li key={targetFile}>
                      <code
                        className="block break-all rounded-md bg-muted px-2 py-1.5 font-mono text-[11px] leading-4"
                        translate="no"
                      >
                        {targetFile}
                      </code>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <p className="border-t border-border pt-2 text-xs leading-5 text-muted-foreground">
            Adds or reuses the shadcn{" "}
            {metadata.shadcnDependencies.map(formatDependency).join(" and ")}{" "}
            components, plus the {metadata.packageDependencies.join(", ")}{" "}
            {metadata.packageDependencies.length === 1 ? "package" : "packages"}
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
