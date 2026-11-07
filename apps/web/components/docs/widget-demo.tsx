"use client";

import { useEffect, useRef, useState } from "react";
import {
  EmojiFeedback,
  FeedbackForm,
  LikeDislike,
  NpsScore,
  StarRating,
  Survey,
  type WidgetState,
} from "@workspace/widgets";
import { Button } from "@workspace/ui/components/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import type { WidgetDemoOptions, WidgetDocConfig } from "@/lib/widget-catalog";

const widgets = { emoji: EmojiFeedback, thumbs: LikeDislike, star: StarRating };

type WidgetDemoProps = {
  widget: Pick<
    WidgetDocConfig,
    "slug" | "preview" | "defaultVariant" | "name" | "example" | "replayText"
  >;
  options?: Partial<WidgetDemoOptions>;
  /** Increment to restart the example and play its scripted flow. */
  replay?: number;
  /** Drops the frame when a surrounding toolbar box already draws one. */
  framed?: boolean;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Drives the real widget through pick, type, send, and thanks, so visitors
// see the whole flow without clicking.
async function playFlow(
  root: HTMLElement,
  preview: WidgetDocConfig["preview"],
  text: string,
  cancelled: () => boolean,
) {
  await wait(450);
  if (cancelled()) return;
  if (preview === "survey") {
    root.querySelectorAll<HTMLElement>('[role="radio"]')[1]?.click();
  } else if (preview !== "form") {
    const choices = root.querySelectorAll<HTMLElement>("button[aria-pressed]");
    choices[preview === "nps" ? 3 : 1]?.click();
  }
  await wait(450);
  const field = root.querySelector("textarea");
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  if (field && setValue) {
    for (let index = 1; index <= text.length; index++) {
      if (cancelled()) return;
      setValue.call(field, text.slice(0, index));
      field.dispatchEvent(new Event("input", { bubbles: true }));
      await wait(30);
    }
  }
  await wait(350);
  if (cancelled()) return;
  [...root.querySelectorAll("button")]
    .find((button) => button.textContent?.trim() === "Send")
    ?.click();
}

/** The one frame every live example renders in. */
export function WidgetDemo({
  widget,
  options,
  replay = 0,
  framed = true,
}: WidgetDemoProps) {
  const resolved = { ...widget.example, ...options };
  const key = [
    widget.slug,
    resolved.layout,
    resolved.variant,
    resolved.size,
    resolved.followUp,
  ].join(":");
  return (
    <WidgetDemoInstance
      key={key}
      widget={widget}
      options={resolved}
      replay={replay}
      framed={framed}
    />
  );
}

function WidgetDemoInstance({
  widget,
  options,
  replay,
  framed,
}: {
  widget: WidgetDemoProps["widget"];
  options: WidgetDemoOptions;
  replay: number;
  framed: boolean;
}) {
  const [instance, setInstance] = useState(0);
  const [state, setState] = useState<WidgetState>("idle");
  const container = useRef<HTMLDivElement>(null);
  const focusAfterReset = useRef(false);
  const Widget =
    widget.preview === "form" || widget.preview === "survey"
      ? null
      : widget.preview === "nps"
        ? NpsScore
        : widgets[widget.preview];

  useEffect(() => {
    if (!focusAfterReset.current) return;
    container.current
      ?.querySelector<HTMLElement>(
        'button[aria-pressed], [role="radio"], textarea',
      )
      ?.focus();
    focusAfterReset.current = false;
  }, [instance]);

  const replaying = useRef(false);
  // Option changes remount this instance; only a new Replay press plays.
  const seenReplay = useRef(replay);
  useEffect(() => {
    if (replay === seenReplay.current) return;
    seenReplay.current = replay;
    replaying.current = true;
    setState("idle");
    setInstance((value) => value + 1);
  }, [replay]);

  useEffect(() => {
    if (!replaying.current || !container.current) return;
    replaying.current = false;
    let cancelled = false;
    void playFlow(
      container.current,
      widget.preview,
      widget.replayText,
      () => cancelled,
    );
    return () => {
      cancelled = true;
    };
  }, [instance, widget.preview, widget.replayText]);

  function reset() {
    focusAfterReset.current = true;
    setState("idle");
    setInstance((value) => value + 1);
  }

  return (
    <div
      role="group"
      aria-label={`${widget.name} example`}
      className={cn(
        "@container relative flex min-h-64 w-full min-w-0 items-center justify-center pt-14 pb-8",
        framed ? "ds-inset" : "bg-background",
      )}
    >
      <div
        ref={container}
        className="flex w-full min-w-0 justify-center @sm:px-3 @lg:px-8"
      >
        {Widget ? (
          <Widget
            key={instance}
            layout={options.layout}
            {...(widget.preview === "nps" ? {} : { variant: options.variant })}
            size={options.size}
            followUp={options.followUp}
            onStateChange={setState}
          />
        ) : widget.preview === "survey" ? (
          <Survey key={instance} onStateChange={setState} />
        ) : (
          <FeedbackForm key={instance} onStateChange={setState} />
        )}
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
