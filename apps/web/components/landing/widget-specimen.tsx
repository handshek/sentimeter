"use client";

import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetLayout,
} from "@workspace/widgets";
import { Button } from "@workspace/ui/components/button";
import { RotateCcw } from "lucide-react";
import { useWidgetReplay } from "@/lib/use-widget-replay";

const specimenContent = {
  emoji: {
    Widget: EmojiFeedback,
    title: "How was getting started?",
    description: "A little feedback goes a long way.",
  },
  thumbs: {
    Widget: LikeDislike,
    title: "Did this answer your question?",
    description: "Help us make these docs more useful.",
  },
  star: {
    Widget: StarRating,
    title: "How was your support experience?",
    description: "Let us know how we did.",
  },
};

export function WidgetSpecimen({
  family = "emoji",
  showInput = false,
  layout = "stacked",
}: {
  family?: keyof typeof specimenContent;
  showInput?: boolean;
  layout?: WidgetLayout;
}) {
  const { key, state, containerRef, onStateChange, replay } = useWidgetReplay();
  const { Widget, title, description } = specimenContent[family];

  return (
    <div
      className="w-full min-w-0 space-y-3"
      role="group"
      aria-label={`${family} feedback example`}
    >
      <div ref={containerRef} className="flex justify-center">
        <Widget
          key={key}
          title={title}
          description={description}
          layout={layout}
          showInput={showInput}
          autoHide={false}
          thankYouMessage="Thanks for sharing."
          onStateChange={onStateChange}
          className={layout === "inline" ? undefined : "w-full"}
        />
      </div>
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground"
          disabled={state === "submitting"}
          onClick={replay}
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          {state === "done" ? "Try again" : "Reset example"}
        </Button>
      </div>
    </div>
  );
}
