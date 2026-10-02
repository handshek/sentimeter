import * as React from "react";
import { redirect } from "next/navigation";
import { hasHostedConfiguration } from "../_lib/hosted-config";
import { widgetDocs } from "../_lib/widget-catalog";
import { WidgetsPlaygroundClient } from "./_components/widgets-playground-client";

export default function WidgetsPlaygroundPage() {
  if (!hasHostedConfiguration()) redirect("/components");

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
      <WidgetsPlaygroundClient
        installMetadata={widgetDocs.map((widget) => widget.installMetadata)}
      />
    </React.Suspense>
  );
}
