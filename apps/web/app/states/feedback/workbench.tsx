"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CornerDownRight,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import type { WidgetLayout, WidgetType } from "@repo/widgets";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { ThemeToggle } from "../../_components/theme-toggle";
import { WidgetFixture, type ScenarioId } from "./widget-fixture";

const scenarios: {
  id: ScenarioId;
  label: string;
  group: string;
  description: string;
}[] = [
  {
    id: "idle",
    label: "Idle",
    group: "Response",
    description:
      "Ready for a response. Choose a reaction to open the comment and actions.",
  },
  {
    id: "selected",
    label: "Selected",
    group: "Response",
    description:
      "A response and comment are ready to send. Cancel clears both.",
  },
  {
    id: "submitting",
    label: "Submitting",
    group: "Submission",
    description:
      "Submission stays pending until you choose another state or restart the scenario.",
  },
  {
    id: "error",
    label: "Failure & retry",
    group: "Submission",
    description:
      "A simulated connection failure preserves the response. Try again succeeds locally.",
  },
  {
    id: "done",
    label: "Done",
    group: "Submission",
    description:
      "Feedback was accepted locally. Confirmation stays visible without auto-hiding.",
  },
  {
    id: "disabled",
    label: "Disabled",
    group: "Availability",
    description: "Choices are disabled while the question remains readable.",
  },
  {
    id: "dismissed",
    label: "Dismissed",
    group: "Availability",
    description:
      "The close action removed the widget. The empty preview is intentional.",
  },
];

const families: { id: WidgetType; label: string }[] = [
  { id: "star", label: "Star rating" },
  { id: "emoji", label: "Emoji feedback" },
  { id: "thumbs", label: "Like / dislike" },
];
const groups = [...new Set(scenarios.map(({ group }) => group))];

export function FeedbackWorkbench() {
  const search = useSearchParams();
  const scenario =
    scenarios.find(({ id }) => id === search.get("__state")) ?? scenarios[0]!;
  const family =
    families.find(({ id }) => id === search.get("widget")) ?? families[0]!;
  const layout: WidgetLayout =
    search.get("layout") === "inline" ? "inline" : "stacked";
  const [revision, setRevision] = useState(0);
  const [controlsHidden, setControlsHidden] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const visibilityRef = useRef<HTMLButtonElement>(null);

  function updateParameter(name: string, value: string) {
    const url = new URL(window.location.href);
    url.searchParams.set(name, value);
    window.history.pushState(null, "", url);
  }

  function toggleControls() {
    setControlsHidden((hidden) => !hidden);
    visibilityRef.current?.focus({ preventScroll: true });
  }

  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !(event.target instanceof HTMLElement) ||
      event.target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="combobox"], [role="listbox"]',
      )
    )
      return;

    if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      toggleControls();
      return;
    }

    const button = event.target.closest<HTMLButtonElement>(
      "button[data-scenario]",
    );
    if (
      !button ||
      !["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)
    )
      return;
    const index = scenarios.findIndex(
      ({ id }) => id === button.dataset.scenario,
    );
    const direction =
      event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    const next =
      scenarios[(index + direction + scenarios.length) % scenarios.length]!;
    event.preventDefault();
    updateParameter("__state", next.id);
    navigationRef.current
      ?.querySelector<HTMLButtonElement>(`[data-scenario="${next.id}"]`)
      ?.focus({ preventScroll: true });
  }

  useEffect(() => {
    const navigation = navigationRef.current;
    const button = navigation?.querySelector<HTMLElement>(
      `[data-scenario="${scenario.id}"]`,
    );
    if (!navigation || !button) return;
    const list = navigation.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    if (item.top < list.top + 6)
      navigation.scrollTop -= list.top + 6 - item.top;
    if (item.bottom > list.bottom - 6)
      navigation.scrollTop += item.bottom - list.bottom + 6;
  }, [scenario.id]);

  return (
    <main className="ds-container space-y-8 py-6 sm:py-10">
      <header className="space-y-6 border-b border-border pb-8">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" asChild>
            <Link href="/design-system/widgets">
              <ArrowLeft aria-hidden="true" /> Feedback widgets
            </Link>
          </Button>
          <ThemeToggle />
        </div>
        <div className="space-y-3">
          <p className="ds-eyebrow text-muted-foreground">Local workbench</p>
          <h1 className="ds-page-title">Every feedback state.</h1>
          <p className="ds-body max-w-2xl text-muted-foreground">
            Explore the real widgets, one state at a time. Responses stay in
            this browser.
          </p>
        </div>
      </header>

      <div className="@container space-y-8">
        <section
          aria-label="Workbench controls"
          onKeyDown={handleKeys}
          className="flex flex-wrap items-end gap-4"
        >
          <div className="min-w-0 space-y-2">
            <Label htmlFor="workbench-widget">Widget</Label>
            <Select
              value={family.id}
              onValueChange={(value) => updateParameter("widget", value)}
            >
              <SelectTrigger id="workbench-widget" className="w-48 max-w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {families.map(({ id, label }) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workbench-layout">Layout</Label>
            <Select
              value={layout}
              onValueChange={(value) => updateParameter("layout", value)}
            >
              <SelectTrigger id="workbench-layout" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="stacked">Stacked</SelectItem>
                <SelectItem value="inline">Inline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3 py-0.5 sm:ml-auto">
            <Button
              variant="outline"
              onClick={() => setRevision((value) => value + 1)}
            >
              <RotateCcw aria-hidden="true" /> Restart scenario
            </Button>
            <Button
              ref={visibilityRef}
              variant="ghost"
              aria-controls="state-switcher"
              aria-expanded={!controlsHidden}
              onClick={toggleControls}
            >
              {controlsHidden ? (
                <Eye aria-hidden="true" />
              ) : (
                <EyeOff aria-hidden="true" />
              )}
              {controlsHidden ? "Show states" : "Hide states"}
            </Button>
          </div>
        </section>

        <div className="grid items-start gap-8 @3xl:grid-cols-[208px_minmax(0,1fr)]">
          <aside
            id="state-switcher"
            hidden={controlsHidden}
            onKeyDown={handleKeys}
            className="space-y-4 @3xl:sticky @3xl:top-6"
          >
            <div className="space-y-2 @3xl:hidden">
              <Label htmlFor="workbench-state">State</Label>
              <Select
                value={scenario.id}
                onValueChange={(value) => updateParameter("__state", value)}
              >
                <SelectTrigger id="workbench-state" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {groups.map((group) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {scenarios
                        .filter((entry) => entry.group === group)
                        .map(({ id, label }) => (
                          <SelectItem key={id} value={id}>
                            {label}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <nav
              ref={navigationRef}
              aria-label="Feedback states"
              className="hidden max-h-[calc(100dvh-6rem)] space-y-6 overflow-y-auto p-1.5 @3xl:block"
            >
              {groups.map((group) => (
                <div
                  key={group}
                  role="group"
                  aria-labelledby={`states-${group}`}
                  className="space-y-2"
                >
                  <h2
                    id={`states-${group}`}
                    className="ds-eyebrow flex items-center gap-2 px-3 text-muted-foreground"
                  >
                    <CornerDownRight className="size-4" aria-hidden="true" />{" "}
                    {group}
                  </h2>
                  <div className="space-y-2">
                    {scenarios
                      .filter((entry) => entry.group === group)
                      .map(({ id, label }) => (
                        <Button
                          key={id}
                          data-scenario={id}
                          aria-pressed={scenario.id === id}
                          variant={scenario.id === id ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => updateParameter("__state", id)}
                        >
                          {label}
                        </Button>
                      ))}
                  </div>
                </div>
              ))}
            </nav>
            <p className="ds-caption text-muted-foreground">
              Arrow keys move through the state list. H hides the switcher while
              its controls are focused.
            </p>
          </aside>

          <section
            aria-label="Widget preview"
            className="min-w-0 space-y-5 @3xl:col-start-2"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="ds-heading">
                {family.label}{" "}
                <span className="text-muted-foreground">
                  / {scenario.label}
                </span>
              </h2>
              <span className="ds-code text-muted-foreground">
                {scenarios.findIndex(({ id }) => id === scenario.id) + 1} /{" "}
                {scenarios.length}
              </span>
            </div>
            <div className="ds-inset flex min-h-[32rem] items-start justify-center px-3 py-8 sm:px-6 sm:py-12">
              <div className="flex w-full min-w-0 justify-center">
                <WidgetFixture
                  key={`${family.id}-${layout}-${scenario.id}-${revision}`}
                  family={family.id}
                  scenario={scenario.id}
                  layout={layout}
                />
              </div>
            </div>
            <p className="ds-body-sm text-muted-foreground">
              {scenario.description}
            </p>
            <p className="ds-caption text-muted-foreground">
              Each state has its own URL. Interact freely, then restart to
              restore the selected scenario.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
