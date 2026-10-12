"use client";

import { useId, useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Info,
  MessageSquare,
  Pencil,
  Search,
  Settings2,
  Star,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";

const iconRows: {
  size: number;
  className: string;
  role: string;
  note: string;
  icons: { Icon: LucideIcon; name: string }[];
}[] = [
  {
    size: 16,
    className: "size-4",
    role: "Inline and dense UI",
    note: "Labels, compact toolbars, and supporting actions.",
    icons: [
      { Icon: Search, name: "Search" },
      { Icon: Copy, name: "Copy" },
      { Icon: Pencil, name: "Edit" },
      { Icon: ArrowRight, name: "Continue" },
    ],
  },
  {
    size: 20,
    className: "size-5",
    role: "Navigation and controls",
    note: "The default for navigation and standalone actions.",
    icons: [
      { Icon: MessageSquare, name: "Messages" },
      { Icon: FileText, name: "Documentation" },
      { Icon: Settings2, name: "Settings" },
      { Icon: Bell, name: "Notifications" },
    ],
  },
  {
    size: 24,
    className: "size-6",
    role: "Emphasis and feedback",
    note: "An empty-state cue or a clearly presented response.",
    icons: [
      { Icon: Star, name: "Rating" },
      { Icon: ThumbsUp, name: "Helpful" },
      { Icon: Check, name: "Complete" },
      { Icon: Info, name: "Information" },
    ],
  },
];

export function IconMotionSpecimens() {
  const id = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const transition = reduceMotion
    ? "transition-none"
    : "duration-(--ds-duration-normal) ease-(--ds-ease) motion-reduce:transition-none";

  return (
    <div className="space-y-14">
      <section aria-labelledby={`${id}-icons`} className="space-y-6">
        <div>
          <h2 id={`${id}-icons`} className="ds-title">
            One family. Three useful scales.
          </h2>
          <p className="ds-body mt-3 max-w-2xl text-muted-foreground">
            Use Lucide’s rounded strokes consistently. Give the glyph a size
            that fits its job, and give the action a target large enough to use.
          </p>
        </div>
        <div className="ds-panel divide-y divide-border overflow-hidden">
          {iconRows.map((row) => (
            <div
              key={row.size}
              className="grid items-center gap-5 p-5 sm:grid-cols-2 sm:p-6"
            >
              <div>
                <p className="ds-code mb-1.5 text-muted-foreground">
                  {row.size} px glyph / 44 px hit area
                </p>
                <h3 className="ds-heading">{row.role}</h3>
                <p className="ds-body-sm mt-1.5 max-w-sm text-muted-foreground">
                  {row.note}
                </p>
              </div>
              <div
                className="flex flex-wrap gap-3 sm:justify-end"
                role="group"
                aria-label={`${row.size} pixel icon examples`}
              >
                {row.icons.map(({ Icon, name }) => (
                  <Button
                    key={name}
                    variant={selected === name ? "secondary" : "outline"}
                    size="icon"
                    className="transition-colors duration-(--ds-duration-fast) motion-reduce:transition-none"
                    aria-label={`${name}, ${row.size} pixel icon`}
                    aria-pressed={selected === name}
                    onClick={() =>
                      setSelected((value) => (value === name ? null : name))
                    }
                  >
                    <Icon
                      aria-hidden="true"
                      className={row.className}
                      strokeWidth={1.75}
                    />
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <p
            role="status"
            className="ds-caption min-h-12 bg-muted/25 px-5 py-4 text-muted-foreground sm:px-6"
          >
            {selected
              ? `${selected} selected in this local specimen. Focus remains on the action.`
              : "Try an icon. Selection and keyboard focus remain separate visual cues."}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="ds-heading">Name the action</h3>
            <p className="ds-body-sm mt-2 text-muted-foreground">
              Icon-only buttons need an accessible name. An icon beside readable
              text is decorative and uses aria-hidden.
            </p>
          </div>
          <div>
            <h3 className="ds-heading">Keep the family consistent</h3>
            <p className="ds-body-sm mt-2 text-muted-foreground">
              Use 1.75 px strokes in product specimens. Native emoji is a
              deliberate feedback option; its appearance belongs to the
              platform.
            </p>
          </div>
        </div>
      </section>
      <section aria-labelledby={`${id}-motion`} className="space-y-6">
        <div>
          <h2 id={`${id}-motion`} className="ds-title">
            Motion explains what changed.
          </h2>
          <p className="ds-body mt-3 max-w-2xl text-muted-foreground">
            A short transition connects an action to its result. Nothing needs
            to move simply to be noticed, and every state remains clear without
            animation.
          </p>
        </div>
        <div className="ds-panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-5 sm:p-6">
            <div>
              <h3 className="ds-heading">A local disclosure</h3>
              <p className="ds-caption mt-1.5 text-muted-foreground">
                180 ms · shared easing · no delayed interaction
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              aria-expanded={expanded}
              aria-controls={`${id}-details`}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Hide details" : "Show details"}
              <ChevronDown
                aria-hidden="true"
                className={`size-4 transition-transform ${transition} ${expanded ? "rotate-180" : "rotate-0"}`}
              />
            </Button>
          </div>
          <div
            id={`${id}-details`}
            aria-hidden={!expanded}
            className={`grid transition-[grid-template-rows,opacity] ${transition} ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="border-b border-border bg-muted/25 p-5 sm:p-6">
                <p className="ds-label flex items-center gap-2">
                  <Check aria-hidden="true" className="size-4 text-primary" />
                  The state is the message.
                </p>
                <p className="ds-body mt-3 max-w-xl text-muted-foreground">
                  The content is available immediately. Focus stays on the
                  disclosure button, and its expanded state tells assistive
                  technology what happened.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-6 p-5 sm:p-6">
            <div>
              <Label htmlFor={`${id}-reduced`}>
                Reduce motion in this preview
              </Label>
              <p
                id={`${id}-reduced-help`}
                className="ds-body-sm mt-1.5 text-muted-foreground"
              >
                The operating system’s reduced-motion preference is also
                respected.
              </p>
            </div>
            <Switch
              id={`${id}-reduced`}
              checked={reduceMotion}
              onCheckedChange={setReduceMotion}
              aria-describedby={`${id}-reduced-help`}
            />
          </div>
        </div>
        <dl className="grid gap-5 sm:grid-cols-3">
          <div>
            <dt className="ds-code">--ds-duration-fast</dt>
            <dd className="ds-body-sm mt-2 text-muted-foreground">
              120 ms for color and control feedback.
            </dd>
          </div>
          <div>
            <dt className="ds-code">--ds-duration-normal</dt>
            <dd className="ds-body-sm mt-2 text-muted-foreground">
              180 ms for a small disclosure or state transition.
            </dd>
          </div>
          <div>
            <dt className="ds-code">--ds-ease</dt>
            <dd className="ds-body-sm mt-2 text-muted-foreground">
              A quick response with a gentle settle. Reduced motion removes
              interpolation.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
