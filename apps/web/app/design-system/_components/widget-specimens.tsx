"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetSize,
} from "@workspace/widgets";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ArrowUpRight, Flame, Heart, RotateCcw, Snowflake } from "lucide-react";
import { widgetDocs } from "../../_lib/widget-catalog";
import { WidgetDemo } from "../../components/_components/widget-demo";
import { SystemSection, UsageNote } from "./system-section";

function SubmissionSpecimen() {
  const [instance, setInstance] = useState(0);
  const attempts = useRef(0);
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    setPending(false);
    attempts.current += 1;
    if (attempts.current === 1)
      throw new Error(
        "This is a simulated connection failure. Try submitting again.",
      );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <div className="ds-inset flex min-w-0 flex-col items-center gap-4 px-3 py-4 sm:p-6">
        <StarRating
          key={instance}
          title="How did the release go?"
          description="Every detail helps us improve the next one."
          showInput
          submit={submit}
          autoHide={false}
        />
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => {
            attempts.current = 0;
            setInstance((value) => value + 1);
          }}
        >
          <RotateCcw className="size-4" aria-hidden="true" /> Reset scenario
        </Button>
      </div>
      <ol className="space-y-6">
        {[
          [
            "Choose a rating",
            "The choice lifts onto a tile in full color and exposes an accessible pressed state. Cancel clears it.",
          ],
          [
            "Submit once",
            "This local example waits, then shows an intentional connection error. Your selection and comment stay in place.",
          ],
          [
            "Try again",
            "The second attempt succeeds. Confirmation replaces the actions without replacing the entire card.",
          ],
        ].map(([title, description], index) => (
          <li key={title} className="grid grid-cols-[24px_1fr] gap-3">
            <span className="ds-code text-muted-foreground">0{index + 1}</span>
            <div className="space-y-2">
              <h3 className="ds-heading">{title}</h3>
              <p className="ds-body-sm text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LayoutSpecimen() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <figure className="min-w-0 space-y-3">
        <div className="ds-inset flex min-h-80 items-center justify-center px-3 py-6 sm:p-6">
          <EmojiFeedback
            title="How was getting started?"
            description="A little feedback goes a long way."
            showInput
            autoHide={false}
          />
        </div>
        <figcaption className="ds-body-sm text-muted-foreground">
          <span className="ds-label text-foreground">Stacked</span> · the
          default. A card with a heading, one recessed well for the rating and
          comment, and a paired Cancel and Submit row.
        </figcaption>
      </figure>
      <figure className="min-w-0 space-y-3">
        <div className="ds-inset flex min-h-80 items-center justify-center px-3 py-6 sm:p-6">
          <EmojiFeedback
            layout="inline"
            title="Was this page helpful?"
            showInput
            autoHide={false}
          />
        </div>
        <figcaption className="ds-body-sm text-muted-foreground">
          <span className="ds-label text-foreground">Inline</span> ·{" "}
          <code className="ds-code">layout=&quot;inline&quot;</code>. A one-line
          bar for docs footers and toolbars. A choice opens the comment; Cancel
          or a sent response collapses it again.
        </figcaption>
      </figure>
    </div>
  );
}

function GlyphSpecimen() {
  return (
    <div className="grid items-start gap-6 md:grid-cols-2 2xl:grid-cols-3">
      <div className="ds-inset flex min-w-0 justify-center px-3 py-5 sm:p-5">
        <EmojiFeedback
          title="How did the launch feel?"
          glyphs={[
            { glyph: "🥶", label: "Cold" },
            { glyph: "😕", label: "Meh" },
            { glyph: "🙂", label: "Fine" },
            { glyph: "😀", label: "Good" },
            { glyph: "🔥", label: "On fire" },
          ]}
          autoHide={false}
          className="w-full"
        />
      </div>
      <div className="ds-inset flex min-w-0 justify-center px-3 py-5 sm:p-5">
        <StarRating
          title="Rate this recipe"
          glyph={{ glyph: <Heart aria-hidden="true" />, label: "heart" }}
          autoHide={false}
          className="w-full"
        />
      </div>
      <div className="ds-inset flex min-w-0 justify-center px-3 py-5 sm:p-5">
        <LikeDislike
          title="Was the demo useful?"
          glyphs={[
            { glyph: <Flame aria-hidden="true" />, label: "Useful" },
            { glyph: <Snowflake aria-hidden="true" />, label: "Not useful" },
          ]}
          autoHide={false}
          className="w-full"
        />
      </div>
    </div>
  );
}

export function WidgetSpecimens() {
  const [variant, setVariant] = useState<"icons" | "emoji">("emoji");
  const [size, setSize] = useState<WidgetSize>("default");
  const [showInput, setShowInput] = useState(true);
  return (
    <>
      <SystemSection
        id="families"
        title="One structure. Three ways to listen."
        description="Try each family with your choice of glyphs, size, and comment field. All interactions on this page stay in your browser; no feedback is sent."
      >
        <div className="flex flex-wrap items-end gap-5 border-b border-border pb-6">
          <div className="space-y-2">
            <Label htmlFor="widget-icon-style">Rating style</Label>
            <Select
              value={variant}
              onValueChange={(value) => setVariant(value as typeof variant)}
            >
              <SelectTrigger id="widget-icon-style" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emoji">Native emoji</SelectItem>
                <SelectItem value="icons">Lucide icons</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="widget-size">Size</Label>
            <Select
              value={size}
              onValueChange={(value) => setSize(value as WidgetSize)}
            >
              <SelectTrigger id="widget-size" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    ["sm", "Small"],
                    ["default", "Default"],
                    ["md", "Medium"],
                    ["lg", "Large"],
                  ] as const
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-h-11 items-center gap-3">
            <Switch
              id="widget-comment"
              checked={showInput}
              onCheckedChange={setShowInput}
            />
            <Label htmlFor="widget-comment">Comment field</Label>
          </div>
        </div>
        <Tabs defaultValue="emoji-feedback">
          <TabsList>
            {widgetDocs.map((widget) => (
              <TabsTrigger key={widget.slug} value={widget.slug}>
                {widget.tabLabel}
              </TabsTrigger>
            ))}
          </TabsList>
          {widgetDocs.map((widget) => (
            <TabsContent key={widget.slug} value={widget.slug} className="pt-6">
              <div className="ds-inset px-3 py-6 sm:p-8">
                <WidgetDemo
                  widget={widget}
                  options={{ variant, size, showInput }}
                />
              </div>
              <Button asChild variant="link" className="mt-6 px-0">
                <Link href={`/components/${widget.slug}`}>
                  Use {widget.name}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </TabsContent>
          ))}
        </Tabs>
        <UsageNote>
          The widget inherits the host app’s fonts, palette, and radius. Faces
          stay grayscale until hovered or chosen; native emoji follow the
          operating system, and Lucide icons give a consistent silhouette.
        </UsageNote>
      </SystemSection>
      <SystemSection
        id="layouts"
        title="Two layouts. The same parts."
        description="Use the stacked card where feedback is the subject, and the inline bar where it should stay out of the way. Both share the rating, comment, footer, and states."
      >
        <LayoutSpecimen />
      </SystemSection>
      <SystemSection
        id="glyphs"
        title="Bring your own glyphs."
        description="Swap the faces, the star, or the thumbs for any emoji, icon, or image. The scale stays fixed (five faces, five stars, two thumbs), so saved values and analytics keep working."
      >
        <GlyphSpecimen />
        <UsageNote>
          Give each glyph a label with{" "}
          <code className="ds-code">{"{ glyph, label }"}</code> so screen
          readers hear “On fire (5 of 5)” instead of “Rating 5 of 5”. A list of
          the wrong length falls back to the built-in set and warns in the
          console.
        </UsageNote>
      </SystemSection>
      <SystemSection
        id="states"
        title="Design the whole conversation."
        description="A dependable widget needs more than an attractive idle state. Try selection, pending, error, retry, and confirmation in this local scenario."
      >
        <SubmissionSpecimen />
      </SystemSection>
      <SystemSection
        id="anatomy"
        title="A composition you can keep building on."
        description="Each part has one job and a predictable place. The same anatomy carries through all three families."
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-5">
            {[
              [
                "Header",
                "One 16 px question, followed by optional supporting text.",
              ],
              [
                "Response well",
                "A recessed group holding the rating tiles and, after a choice, the comment.",
              ],
              [
                "Rating",
                "Evenly spaced 44 px tiles; glyphs stay grayscale until hovered or chosen.",
              ],
              [
                "Comment",
                "An optional field named by a hidden label, with a placeholder hint.",
              ],
              [
                "Footer",
                "Cancel and Submit, nearby errors, then a confirmation of the same height.",
              ],
            ].map(([title, description]) => (
              <div key={title} className="border-l border-border pl-4">
                <h3 className="ds-heading">{title}</h3>
                <p className="mt-1 ds-body-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
          <div className="ds-inset space-y-4 p-5">
            <p className="ds-eyebrow text-muted-foreground">
              The default recipe
            </p>
            <pre
              className="ds-code overflow-x-auto"
              tabIndex={0}
              aria-label="Widget usage example"
            >
              <code>{`<EmojiFeedback\n  title="How was your experience?"\n  showInput\n  autoHide={false}\n/>`}</code>
            </pre>
            <p className="ds-body-sm text-muted-foreground">
              Use the wrappers for a quick start, or compose the header,
              response well, rating, input, and footer around your own content.
              Keep the shared recipes so spacing and states remain consistent.
            </p>
            <Link
              href="/components/getting-started"
              className="ds-label inline-flex min-h-11 items-center gap-2 rounded-sm underline underline-offset-4 focus-visible:ds-focus"
            >
              Read the integration guide{" "}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </SystemSection>
    </>
  );
}
