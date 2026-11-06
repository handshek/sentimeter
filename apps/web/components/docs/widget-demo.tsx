"use client";

import { EmojiFeedback, LikeDislike, StarRating } from "@workspace/widgets";
import { Button } from "@workspace/ui/components/button";
import { RotateCcw } from "lucide-react";
import type { WidgetDemoOptions, WidgetDocConfig } from "@/lib/widget-catalog";
import { useWidgetReplay } from "@/lib/use-widget-replay";

const widgets = { emoji: EmojiFeedback, thumbs: LikeDislike, star: StarRating };

type WidgetDemoProps = {
  widget: Pick<WidgetDocConfig, "slug" | "preview" | "defaultVariant" | "name">;
  options?: Partial<WidgetDemoOptions>;
};

export function WidgetDemo(props: WidgetDemoProps) {
  const { widget, options } = props;
  const key = [
    widget.slug,
    options?.layout ?? "stacked",
    options?.variant ?? widget.defaultVariant,
    options?.size ?? "default",
    options?.showInput ?? false,
  ].join(":");
  return <WidgetDemoInstance key={key} {...props} />;
}

function WidgetDemoInstance({ widget, options }: WidgetDemoProps) {
  const { key, state, containerRef, onStateChange, replay } = useWidgetReplay();
  const Widget = widgets[widget.preview];

  return (
    <div
      role="group"
      aria-label={`${widget.name} local demo`}
      className="w-full min-w-0 space-y-2"
    >
      <div
        ref={containerRef}
        className="flex min-h-36 w-full items-center justify-center"
      >
        <Widget
          key={key}
          layout={options?.layout ?? "stacked"}
          variant={options?.variant ?? widget.defaultVariant}
          size={options?.size ?? "default"}
          showInput={options?.showInput ?? false}
          autoHide={false}
          onStateChange={onStateChange}
        />
      </div>
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={replay}
          disabled={state === "submitting"}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {state === "done" ? "Try again" : "Reset"}
        </Button>
      </div>
    </div>
  );
}
