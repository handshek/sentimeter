"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  WidgetSubmitError,
  useFeedbackContext,
  type WidgetLayout,
  type WidgetSubmit,
  type WidgetType,
} from "@repo/widgets";

export type ScenarioId =
  | "idle"
  | "selected"
  | "submitting"
  | "error"
  | "done"
  | "disabled"
  | "dismissed";

type WidgetFixtureProps = {
  family: WidgetType;
  scenario: ScenarioId;
  layout: WidgetLayout;
};

const fixtures = {
  emoji: {
    Component: EmojiFeedback,
    title: "How was getting started?",
    description: "Your feedback helps us improve the setup experience.",
    comment:
      "The setup guide was clear. A sample project would help me get started faster.",
    value: 4,
  },
  star: {
    Component: StarRating,
    title: "How did the release go?",
    description: "Every detail helps us improve the next one.",
    comment:
      "The release notes made the upgrade straightforward. Thanks for the migration examples.",
    value: 4,
  },
  thumbs: {
    Component: LikeDislike,
    title: "Was this guide helpful?",
    description: "Tell us what worked and what could be clearer.",
    comment:
      "The working example answered my question. An explanation of error handling would be useful too.",
    value: 1,
  },
} as const;

function ScenarioDriver({
  scenario,
  value,
  comment,
}: {
  scenario: ScenarioId;
  value: number;
  comment: string;
}) {
  const { state, select, setText, cancel, containerRef } = useFeedbackContext();
  const phase = useRef<"initial" | "selected" | "ready">("initial");

  useEffect(() => {
    if (phase.current === "ready") return;

    if (scenario === "idle" || scenario === "disabled") {
      phase.current = "ready";
      return;
    }

    if (scenario === "dismissed") {
      phase.current = "ready";
      cancel();
      return;
    }

    if (phase.current === "initial") {
      phase.current = scenario === "selected" ? "ready" : "selected";
      setText(comment);
      select(value);
      return;
    }

    if (state !== "selected") return;

    const submitButton = Array.from(
      containerRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-slot="feedback-footer"] button',
      ) ?? [],
    ).at(-1);

    if (!submitButton) {
      throw new Error(
        "The feedback workbench could not find the Submit action.",
      );
    }

    phase.current = "ready";
    submitButton.click();
  }, [cancel, comment, containerRef, scenario, select, setText, state, value]);

  return null;
}

function WidgetInstance({ family, scenario, layout }: WidgetFixtureProps) {
  const { Component, title, description, comment, value } = fixtures[family];
  const attempts = useRef(0);
  const [closed, setClosed] = useState(false);

  const submit = useCallback<WidgetSubmit>(async () => {
    attempts.current += 1;

    if (scenario === "submitting") {
      return new Promise<void>(() => {});
    }

    if (scenario === "error" && attempts.current === 1) {
      throw new WidgetSubmitError(
        "network_error",
        "We couldn’t send your feedback. Try again.",
      );
    }
  }, [scenario]);

  return (
    <>
      <Component
        title={
          <>
            {title}
            <ScenarioDriver
              scenario={scenario}
              value={value}
              comment={comment}
            />
          </>
        }
        description={description}
        location="/local-state-workbench"
        layout={layout}
        showInput
        closeButton
        autoHide={false}
        disabled={scenario === "disabled"}
        submit={submit}
        onCancel={() => setClosed(true)}
      />
      {closed ? (
        <p className="ds-body-sm text-muted-foreground">
          {scenario === "dismissed"
            ? "The widget was dismissed. Choose another state to show it again."
            : "The widget was dismissed. Restart the scenario to show it again."}
        </p>
      ) : null}
    </>
  );
}

export function WidgetFixture(props: WidgetFixtureProps) {
  return (
    <WidgetInstance
      key={`${props.family}:${props.scenario}:${props.layout}`}
      {...props}
    />
  );
}
