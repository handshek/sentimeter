import * as React from "react";
import registry from "../../../registry/registry.json";
import type { WidgetInstallMetadata } from "../components/_components/widget-install-command";
import { WidgetsPlaygroundClient } from "./_components/widgets-playground-client";

type RegistryItem = (typeof registry.items)[number];

const showcaseWidgets = [
  { slug: "emoji-feedback", tabLabel: "Emoji" },
  { slug: "like-dislike", tabLabel: "Thumbs" },
  { slug: "star-rating", tabLabel: "Stars" },
] as const;

function getRegistryItem(name: string): RegistryItem {
  const item = registry.items.find((candidate) => candidate.name === name);

  if (!item) {
    throw new Error(`Missing registry item: ${name}`);
  }

  return item;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function getInstallMetadata(): WidgetInstallMetadata[] {
  const sharedItem = getRegistryItem("feedback-system");
  const sharedFiles = sharedItem.files.map((file) => file.target);
  const packageDependencies = unique(sharedItem.dependencies ?? []);
  const shadcnDependencies = unique(
    sharedItem.registryDependencies ?? [],
  ).filter((dependency) => !dependency.startsWith("http"));

  return showcaseWidgets.map(({ slug, tabLabel }) => {
    const widgetItem = getRegistryItem(slug);
    const widgetFiles = widgetItem.files.map((file) => file.target);

    return {
      slug,
      name: widgetItem.title,
      tabLabel,
      registryName: widgetItem.name,
      targetFiles: unique([...widgetFiles, ...sharedFiles]),
      widgetFileCount: widgetFiles.length,
      sharedFileCount: sharedFiles.length,
      packageDependencies: unique([
        ...packageDependencies,
        ...(widgetItem.dependencies ?? []),
      ]),
      shadcnDependencies,
    };
  });
}

export default function WidgetsPlaygroundPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground sm:px-6">
            Loading Widgets…
          </div>
        </div>
      }
    >
      <WidgetsPlaygroundClient installMetadata={getInstallMetadata()} />
    </React.Suspense>
  );
}
