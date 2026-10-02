"use client";

import { useEffect, useRef, useState } from "react";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetState,
} from "@repo/widgets";
import { Button } from "@workspace/ui/components/button";
import { RotateCcw } from "lucide-react";
import type {
  WidgetDemoOptions,
  WidgetDocConfig,
} from "../../_lib/widget-catalog";

const presets = { emoji: EmojiFeedback, thumbs: LikeDislike, star: StarRating };

type WidgetDemoProps = {
  widget: Pick<WidgetDocConfig, "slug" | "preview" | "defaultVariant" | "name">;
  options?: Partial<WidgetDemoOptions>;
};

export function WidgetDemo(props: WidgetDemoProps) {
  const { widget, options } = props;
  const key = [
    widget.slug,
    options?.variant ?? widget.defaultVariant,
    options?.size ?? "default",
    options?.showInput ?? false,
  ].join(":");
  return <WidgetDemoInstance key={key} {...props} />;
}

function WidgetDemoInstance({ widget, options }: WidgetDemoProps) {
  const [instance, setInstance] = useState(0);
  const [state, setState] = useState<WidgetState>("idle");
  const container = useRef<HTMLDivElement>(null);
  const focusAfterReset = useRef(false);
  const Preset = presets[widget.preview];

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
      aria-label={`${widget.name} local demo`}
      className="w-full min-w-0 space-y-2"
    >
      <div
        ref={container}
        className="flex min-h-36 w-full items-center justify-center"
      >
        <Preset
          key={instance}
          variant={options?.variant ?? widget.defaultVariant}
          size={options?.size ?? "default"}
          showInput={options?.showInput ?? false}
          autoHide={false}
          onStateChange={setState}
        />
      </div>
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={reset}
          disabled={state === "submitting"}
          className="h-11"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {state === "done" ? "Try Again" : "Reset"}
        </Button>
      </div>
    </div>
  );
}
