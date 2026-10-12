"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { SystemSection, UsageNote } from "./system-section";

const typeRoles = [
  {
    name: "Display",
    className: "ds-display",
    size: "44–72 / 1.04",
    use: "A single marketing promise",
    sample: "A little feedback. A better product.",
  },
  {
    name: "Page title",
    className: "ds-page-title",
    size: "32–44 / 1.12",
    use: "The subject of the page",
    sample: "Make yourself at home.",
  },
  {
    name: "Section title",
    className: "ds-section-title",
    size: "28–36 / 1.16",
    use: "A new idea within a page",
    sample: "Small signals, useful context.",
  },
  {
    name: "Title",
    className: "ds-title",
    size: "20 / 1.3",
    use: "Cards, groups, and dialogs",
    sample: "How was your experience?",
  },
  {
    name: "Lead",
    className: "ds-lead",
    size: "18–20 / 1.65",
    use: "An introduction with room to breathe",
    sample: "Thoughtful feedback belongs in the flow of your product.",
  },
  {
    name: "Body",
    className: "ds-body",
    size: "16 / 1.65",
    use: "Documentation and longer explanations",
    sample:
      "Start with a clear question. Let people share a reaction, add context if they want to, and get back to what they were doing.",
  },
  {
    name: "Heading",
    className: "ds-heading",
    size: "16 / 1.5",
    use: "Item titles in lists, cards, and FAQs",
    sample: "Install the source",
  },
  {
    name: "Body small",
    className: "ds-body-sm",
    size: "14 / 1.6",
    use: "Descriptions under item titles",
    sample: "One shadcn command adds readable React files.",
  },
  {
    name: "Label",
    className: "ds-label",
    size: "14 / 1.43",
    use: "Navigation, controls, and field labels",
    sample: "Additional feedback (optional)",
  },
  {
    name: "Caption",
    className: "ds-caption",
    size: "12 / 1.5",
    use: "Supporting details and timestamps",
    sample: "Last response 2 minutes ago · 24 responses this week",
  },
  {
    name: "Code",
    className: "ds-code",
    size: "13 / 1.6",
    use: "Commands, identifiers, and source",
    sample: "<EmojiFeedback showInput />",
  },
  {
    name: "Eyebrow",
    className: "ds-eyebrow",
    size: "11 / 1.5",
    use: "Short editorial labels, used sparingly",
    sample: "Designed to belong",
  },
] as const;

export function TypographySpecimens() {
  const [sample, setSample] = useState("Good things start with listening.");
  return (
    <div>
      <SystemSection
        id="font-lab"
        title="The voice of the interface"
        description="Geist Sans and Geist Mono, served from this site. Type a line to see it in the section-title role."
      >
        <div className="ds-panel overflow-hidden">
          <div className="border-b border-border bg-muted/30 p-5">
            <div className="space-y-2">
              <Label htmlFor="type-sample">Specimen text</Label>
              <Input
                id="type-sample"
                value={sample}
                maxLength={100}
                onChange={(event) => setSample(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-7 p-6 sm:p-10">
            <p className="ds-eyebrow text-muted-foreground">
              Geist Sans + Geist Mono
            </p>
            <p className="ds-section-title min-h-24 break-words">
              {sample || "Write something worth listening to."}
            </p>
            <p className="ds-body max-w-xl text-muted-foreground">
              Clear interfaces, long-form docs, and a confident landing page.
            </p>
            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-border pt-6">
              <p className="ds-body">
                Aa Bb Cc Dd Ee Ff Gg
                <br />
                0123456789 & @ ? !
              </p>
              <p className="ds-code text-muted-foreground">
                400 Regular
                <br />
                500 Medium · 600 Semibold
              </p>
            </div>
          </div>
        </div>
        <UsageNote>
          The site loads Geist locally, with no external font service. The
          widget never loads fonts; it inherits the host app’s font.
        </UsageNote>
      </SystemSection>
      <SystemSection
        id="scale"
        title="A role for every line"
        description="Choose a role by its job. Display type is fluid; small text stays readable. Text roles include font family, size, weight, line height, and tracking."
      >
        <div className="divide-y divide-border border-y border-border">
          {typeRoles.map((role) => (
            <div key={role.name} className="space-y-5 py-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="ds-label">{role.name}</h3>
                  <p className="ds-caption mt-1 text-muted-foreground">
                    {role.use}
                  </p>
                </div>
                <p className="ds-code text-muted-foreground">
                  {role.className} <span className="ml-3">{role.size}</span>
                </p>
              </div>
              <p className={`${role.className} max-w-full break-words`}>
                {role.sample}
              </p>
            </div>
          ))}
        </div>
        <UsageNote>
          Sizes are pixels at a 16 px root, followed by the line-height ratio.
          Use semantic HTML independently of visual size: every page has one h1;
          subsequent sections follow a meaningful heading order.
        </UsageNote>
      </SystemSection>
      <SystemSection id="reading" title="Text that holds together">
        <div className="grid gap-6 xl:grid-cols-2">
          <article className="ds-panel space-y-5 p-6">
            <p className="ds-eyebrow text-muted-foreground">
              Reading / 65ch maximum
            </p>
            <h3 className="ds-title">Ask at the right moment.</h3>
            <p className="ds-body text-muted-foreground">
              A useful question follows something specific: finishing setup,
              reading an answer, or resolving an issue. Explain why you are
              asking, then leave room for a short response.
            </p>
            <p className="ds-body text-muted-foreground">
              Use{" "}
              <strong className="font-semibold text-foreground">
                emphasis for meaning
              </strong>
              , a{" "}
              <Link
                href="/components/getting-started"
                className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:ds-focus"
              >
                descriptive link
              </Link>{" "}
              for the next step, and sentence case for a human voice.
            </p>
          </article>
          <div className="ds-panel space-y-6 p-6">
            <p className="ds-eyebrow text-muted-foreground">
              Numbers / tabular alignment
            </p>
            <h3 className="ds-title">This week in feedback</h3>
            <dl className="divide-y divide-border">
              {[
                ["Responses", "1,284"],
                ["Positive", "1,096"],
                ["With a comment", "248"],
              ].map(([label, number]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between py-3"
                >
                  <dt className="ds-label text-muted-foreground">{label}</dt>
                  <dd className="ds-title tabular-nums">{number}</dd>
                </div>
              ))}
            </dl>
            <p className="ds-caption text-muted-foreground">
              Sample figures. Use proportional text for reading, tabular figures
              for data, and mono only for code and identifiers.
            </p>
          </div>
        </div>
      </SystemSection>
    </div>
  );
}
