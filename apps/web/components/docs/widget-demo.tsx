"use client";

import { useEffect, useRef, useState } from "react";
import {
  EmojiFeedback,
  LikeDislike,
  NpsScore,
  StarRating,
  type WidgetState,
} from "@workspace/widgets";
import { Button } from "@workspace/ui/components/button";
import { RotateCcw } from "lucide-react";
import type { WidgetDemoOptions, WidgetDocConfig } from "@/lib/widget-catalog";

const widgets = { emoji: EmojiFeedback, thumbs: LikeDislike, star: StarRating };

type WidgetDemoProps = {
  widget: Pick<
    WidgetDocConfig,
    "slug" | "preview" | "defaultVariant" | "name" | "example"
  >;
  options?: Partial<WidgetDemoOptions>;
};

/** The one frame every live example renders in. */
export function WidgetDemo({ widget, options }: WidgetDemoProps) {
  const resolved = { ...widget.example, ...options };
  const key = [
    widget.slug,
    resolved.layout,
    resolved.variant,
    resolved.size,
    resolved.followUp,
  ].join(":");
  return <WidgetDemoInstance key={key} widget={widget} options={resolved} />;
}

function WidgetDemoInstance({
  widget,
  options,
}: {
  widget: WidgetDemoProps["widget"];
  options: WidgetDemoOptions;
}) {
  const [instance, setInstance] = useState(0);
  const [state, setState] = useState<WidgetState>("idle");
  const container = useRef<HTMLDivElement>(null);
  const focusAfterReset = useRef(false);
  const Widget = widget.preview === "nps" ? NpsScore : widgets[widget.preview];

  useEffect(() => {
    if (!focusAfterReset.current) return;
    container.current
      ?.querySelector<HTMLButtonElement>("button[aria-pressed]")
      ?.focus();
    focusAfterReset.current = false;
  }, [instance]);

  function reset() {
    focusAfterReset.current = true;
    setState("idle");
    setInstance((value) => value + 1);
  }

  return (
    <div
      role="group"
      aria-label={`${widget.name} example`}
      className="ds-inset @container relative flex min-h-64 w-full min-w-0 items-center justify-center pt-14 pb-8"
    >
      <div
        ref={container}
        className="flex w-full min-w-0 justify-center @sm:px-3 @lg:px-8"
      >
        <Widget
          key={instance}
          layout={options.layout}
          {...(widget.preview === "nps" ? {} : { variant: options.variant })}
          size={options.size}
          followUp={options.followUp}
          onStateChange={setState}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        className="absolute top-2 right-2 text-muted-foreground"
        onClick={reset}
        disabled={state === "submitting"}
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  );
}
