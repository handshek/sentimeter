"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Check, Copy, Terminal } from "lucide-react";

const REGISTRY_BASE_URL = "https://registry.handshek.workers.dev/r";
const COPY_CONFIRMATION_DURATION_MS = 1400;

const packageManagers = ["bun", "pnpm", "npm", "yarn"] as const;

export type PackageManager = (typeof packageManagers)[number];

export type WidgetInstallMetadata = {
  slug: "emoji-feedback" | "like-dislike" | "star-rating";
  name: string;
  tabLabel: string;
  registryName: string;
  targetFiles: string[];
  widgetFileCount: number;
  sharedFileCount: number;
  packageDependencies: string[];
  shadcnDependencies: string[];
};

type WidgetInstallCommandProps = {
  registryName: string;
  defaultManager?: PackageManager;
  metadata?: WidgetInstallMetadata;
};

function getInstallCommands(registryName: string) {
  const registryUrl = `${REGISTRY_BASE_URL}/${registryName}.json`;

  return {
    bun: `bunx shadcn@latest add "${registryUrl}"`,
    pnpm: `pnpm dlx shadcn@latest add "${registryUrl}"`,
    npm: `npx shadcn@latest add "${registryUrl}"`,
    yarn: `yarn dlx shadcn@latest add "${registryUrl}"`,
  } satisfies Record<PackageManager, string>;
}

function formatDependency(name: string) {
  if (name === "button") return "Button";
  if (name === "textarea") return "Textarea";
  return name;
}

export function WidgetInstallCommand({
  registryName,
  defaultManager = "pnpm",
  metadata,
}: WidgetInstallCommandProps) {
  const [manager, setManager] = React.useState<PackageManager>(defaultManager);
  const [copied, setCopied] = React.useState(false);
  const resetTimerRef = React.useRef<number | null>(null);
  const commands = React.useMemo(
    () => getInstallCommands(registryName),
    [registryName],
  );
  const activeCommand = commands[manager];

  const clearResetTimer = React.useCallback(() => {
    if (resetTimerRef.current === null) return;
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = null;
  }, []);

  React.useEffect(() => clearResetTimer, [clearResetTimer]);

  React.useEffect(() => {
    clearResetTimer();
    setCopied(false);
  }, [clearResetTimer, manager, registryName]);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(activeCommand);
      setCopied(true);
      clearResetTimer();
      resetTimerRef.current = window.setTimeout(
        () => setCopied(false),
        COPY_CONFIRMATION_DURATION_MS,
      );
    } catch {
      window.prompt("Copy install command:", activeCommand);
    }
  }

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
            <TabsList className="h-auto max-w-full bg-transparent p-0">
              {packageManagers.map((packageManager) => (
                <TabsTrigger
                  key={packageManager}
                  value={packageManager}
                  className="h-auto px-2 py-1 font-mono text-xs text-zinc-400 hover:text-zinc-100 data-active:bg-zinc-900 data-active:text-zinc-100 sm:px-3"
                  translate="no"
                >
                  {packageManager}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void copyCommand()}
              className="ml-auto h-8 shrink-0 text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              {copied ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy Command"}
            </Button>
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? "Install command copied to clipboard" : ""}
            </span>
          </div>

          {packageManagers.map((packageManager) => (
            <TabsContent
              key={packageManager}
              value={packageManager}
              className="m-0"
            >
              <code
                className="block overflow-x-auto whitespace-nowrap px-4 py-3 font-mono text-[13px] text-zinc-300"
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
              <AccordionTrigger className="py-2 text-xs">
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
