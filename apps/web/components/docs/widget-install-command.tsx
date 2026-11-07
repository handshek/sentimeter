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
} from "@/lib/widget-catalog";

export type {
  PackageManager,
  WidgetInstallMetadata,
} from "@/lib/widget-catalog";

type WidgetInstallCommandProps = {
  registryName: string;
  metadata?: WidgetInstallMetadata;
};

const managerKey = "sentimeter:package-manager";
const managerListeners = new Set<() => void>();
let unsavedManager: PackageManager | null = null;

function subscribeManager(listener: () => void) {
  managerListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    managerListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readManager(): PackageManager {
  if (unsavedManager) return unsavedManager;
  try {
    const stored = localStorage.getItem(managerKey);
    return packageManagers.find((manager) => manager === stored) ?? "bun";
  } catch {
    return "bun";
  }
}

// Every install command on every page follows the reader's last choice.
function chooseManager(manager: PackageManager) {
  try {
    localStorage.setItem(managerKey, manager);
    unsavedManager = null;
  } catch {
    // Without storage, the choice still holds until the page reloads.
    unsavedManager = manager;
  }
  managerListeners.forEach((listener) => listener());
}

function formatDependency(name: string) {
  if (name === "button") return "Button";
  if (name === "textarea") return "Textarea";
  if (name === "label") return "Label";
  return name;
}

export function WidgetInstallCommand({
  registryName,
  metadata,
}: WidgetInstallCommandProps) {
  const manager = React.useSyncExternalStore(
    subscribeManager,
    readManager,
    () => "bun" as const,
  );
  const commands = React.useMemo(
    () => getInstallCommands(registryName),
    [registryName],
  );
  const activeCommand = commands[manager];

  return (
    <div className="min-w-0 space-y-3">
      <div className="ds-inset min-w-0 overflow-hidden">
        <Tabs
          value={manager}
          onValueChange={(value) => chooseManager(value as PackageManager)}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2 border-b border-border px-2 py-2 sm:px-3">
            <Terminal
              className="hidden size-4 shrink-0 text-muted-foreground sm:block"
              aria-hidden="true"
            />
            <TabsList className="max-w-full bg-transparent p-0">
              {packageManagers.map((packageManager) => (
                <TabsTrigger
                  key={packageManager}
                  value={packageManager}
                  className="min-w-11 px-2 py-1 font-mono text-xs text-muted-foreground hover:text-foreground data-active:bg-background data-active:text-foreground sm:px-3"
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
                label="Copy command"
                className="px-2 text-xs sm:px-3 sm:text-sm"
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
                className="block whitespace-pre-wrap break-all px-4 py-3 ds-code"
                translate="no"
              >
                {commands[packageManager]}
              </code>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {metadata ? (
        <div className="px-1 py-1">
          <p className="ds-body-sm text-muted-foreground">
            Adds{" "}
            {metadata.widgetFiles.map((file) => (
              <code
                key={file}
                className="ds-code text-foreground"
                translate="no"
              >
                {file}
              </code>
            ))}{" "}
            and the shared{" "}
            <code className="ds-code text-foreground" translate="no">
              {metadata.sharedFolder}
            </code>{" "}
            folder.
          </p>

          <Accordion type="single" collapsible className="mt-1">
            <AccordionItem value="installed-files" className="border-0">
              <AccordionTrigger className="min-h-11 py-2 text-sm">
                View all {metadata.targetFiles.length} files
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <ul className="space-y-1.5">
                  {metadata.targetFiles.map((targetFile) => (
                    <li key={targetFile}>
                      <code
                        className="ds-code block break-all rounded-md bg-muted px-2 py-1.5"
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

          <p className="border-t border-border pt-3 ds-caption text-muted-foreground">
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
