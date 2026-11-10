"use client";

import { useEffect, useRef, useState } from "react";
import {
  EmojiFeedback,
  FeedbackForm,
  LikeDislike,
  NpsScore,
  StarRating,
  Survey,
  type FaceGlyphs,
  type ThumbGlyphs,
  type WidgetState,
} from "@workspace/widgets";
import { Button } from "@workspace/ui/components/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type {
  WidgetDemoOptions,
  WidgetDocConfig,
  WidgetExampleProps,
} from "@/lib/widget-catalog";

type DemoOptions = WidgetDemoOptions & WidgetExampleProps;

type WidgetDemoProps = {
  widget: Pick<WidgetDocConfig, "slug" | "preview" | "name" | "example">;
  options?: Partial<DemoOptions>;
  /** Increment to restart the example from a control outside the frame. */
  reset?: number;
  /** Drops the frame and its Reset when a surrounding toolbar draws them. */
  framed?: boolean;
};

/** The one frame every live example renders in. */
export function WidgetDemo({
  widget,
  options,
  reset = 0,
  framed = true,
}: WidgetDemoProps) {
  const resolved: DemoOptions = { ...widget.example, ...options };
  // Any option change starts a fresh example.
  const key = `${widget.slug}:${JSON.stringify(resolved)}`;
  return (
    <WidgetDemoInstance
      key={key}
      widget={widget}
      options={resolved}
      reset={reset}
      framed={framed}
    />
  );
}

function DemoWidget({
  preview,
  options,
  onStateChange,
}: {
  preview: WidgetDocConfig["preview"];
  options: DemoOptions;
  onStateChange: (state: WidgetState) => void;
}) {
  const { layout, size, followUp, title, description } = options;
  const rating = { layout, size, followUp, onStateChange };
  const text = {
    ...(title === undefined ? {} : { title }),
    ...(description === undefined ? {} : { description }),
  };
  switch (preview) {
    case "emoji":
      return (
        <EmojiFeedback
          {...rating}
          {...text}
          glyphs={options.glyphs as FaceGlyphs | undefined}
        />
      );
    case "thumbs":
      return (
        <LikeDislike
          {...rating}
          {...text}
          glyphs={options.glyphs as ThumbGlyphs | undefined}
        />
      );
    case "star":
      return <StarRating {...rating} {...text} glyph={options.glyph} />;
    case "nps":
      return <NpsScore {...rating} {...text} />;
    case "survey":
      return (
        <Survey
          {...(title === undefined ? {} : { title })}
          options={options.options}
          onStateChange={onStateChange}
        />
      );
    default:
      return (
        <FeedbackForm
          {...(title === undefined ? {} : { title })}
          {...(options.placeholder === undefined
            ? {}
            : { placeholder: options.placeholder })}
          onStateChange={onStateChange}
        />
      );
  }
}

function WidgetDemoInstance({
  widget,
  options,
  reset,
  framed,
}: {
  widget: WidgetDemoProps["widget"];
  options: DemoOptions;
  reset: number;
  framed: boolean;
}) {
  const [instance, setInstance] = useState(0);
  const [state, setState] = useState<WidgetState>("idle");
  const container = useRef<HTMLDivElement>(null);
  const focusAfterReset = useRef(false);

  useEffect(() => {
    if (!focusAfterReset.current) return;
    container.current
      ?.querySelector<HTMLElement>(
        'button[aria-pressed], [role="radio"], textarea',
      )
      ?.focus();
    focusAfterReset.current = false;
  }, [instance]);

  function restart() {
    focusAfterReset.current = true;
    setState("idle");
    setInstance((value) => value + 1);
  }

  // Option changes remount this instance; only a new outside Reset restarts it.
  const seenReset = useRef(reset);
  useEffect(() => {
    if (reset === seenReset.current) return;
    seenReset.current = reset;
    restart();
  }, [reset]);

  return (
    <div
      role="group"
      aria-label={`${widget.name} example`}
      className={cn(
        "@container relative flex min-h-64 w-full min-w-0 items-center justify-center py-10",
        framed ? "ds-inset pt-14 pb-8" : "bg-background",
      )}
    >
      <div
        ref={container}
        className="flex w-full min-w-0 justify-center @sm:px-3 @lg:px-8"
      >
        <DemoWidget
          key={instance}
          preview={widget.preview}
          options={options}
          onStateChange={setState}
        />
      </div>
      {framed ? (
        <Button
          type="button"
          variant="ghost"
          className="absolute top-2 right-2 text-muted-foreground"
          onClick={restart}
          disabled={state === "submitting"}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Reset
        </Button>
      ) : null}
    </div>
  );
}
