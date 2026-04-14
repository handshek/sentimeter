"use client";

import { useCallback, useState } from "react";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetSubmit,
} from "@repo/widgets";

const mockSubmit: WidgetSubmit = () =>
  new Promise<void>((resolve) => setTimeout(resolve, 500));

export function DemoWidget({
  kind,
  label,
}: {
  kind: "emoji" | "thumbs" | "stars";
  label: string;
}) {
  const [instance, setInstance] = useState(0);

  const handleStateChange = useCallback((state: string) => {
    if (state === "done") {
      setTimeout(() => setInstance((current) => current + 1), 2200);
    }
  }, []);

  const props = {
    key: instance,
    submit: mockSubmit,
    doneDurationMs: 2000,
    onStateChange: handleStateChange,
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="group/preview relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-size-[16px_16px] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.06),transparent)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative flex items-center justify-center px-8 py-10 sm:px-12 sm:py-14">
          {kind === "emoji" && <EmojiFeedback {...props} />}
          {kind === "thumbs" && <LikeDislike {...props} />}
          {kind === "stars" && <StarRating {...props} />}
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
