import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  Check,
  Github,
  Layers3,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  getUsageSnippet,
  REPOSITORY_URL,
  widgetDocs,
} from "../../_lib/widget-catalog";
import { CodeBlock } from "../../components/_components/code-block";
import { WidgetSpecimen } from "./widget-specimen";

const scenarios = [
  {
    number: "01",
    family: "emoji" as const,
    slug: "emoji-feedback",
    eyebrow: "After onboarding · Feature discovery",
    title: "Make room for a feeling.",
    description:
      "Five reactions tell you how an experience landed. Add an optional comment when a little context would help.",
    name: "Emoji feedback",
    detail: "Five-point sentiment · Emoji, icons, or your own glyphs",
  },
  {
    number: "02",
    family: "thumbs" as const,
    slug: "like-dislike",
    eyebrow: "Documentation · AI responses",
    title: "Ask one useful question.",
    description:
      "A simple yes or no, right where someone needs it. A lightweight way to learn which answers actually help.",
    name: "Like / dislike",
    layout: "inline" as const,
    detail: "Binary feedback · Inline, out of the way until chosen",
  },
  {
    number: "03",
    family: "star" as const,
    slug: "star-rating",
    eyebrow: "Support · Completed experiences",
    title: "Give the experience a measure.",
    description:
      "A familiar five-star scale for the moments that deserve a closer look. Keep the rating, invite the story behind it.",
    name: "Star rating",
    detail: "Five-star rating · Hover and keyboard feedback",
  },
];

export function ShowcaseSection() {
  return (
    <section
      id="widgets"
      aria-labelledby="collection-title"
      className="border-t border-border"
    >
      <div className="ds-container ds-section">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="ds-eyebrow mb-4 text-muted-foreground">
              The collection
            </p>
            <h2 id="collection-title" className="ds-section-title text-balance">
              The right question.
              <br />
              The right moment.
            </h2>
          </div>
          <p className="ds-body max-w-sm text-muted-foreground">
            Three response types. One considered foundation. Each one is real,
            interactive, and ready for your codebase.
          </p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {scenarios.map((scenario) => (
            <article
              key={scenario.slug}
              className="grid gap-7 py-8 md:grid-cols-2 md:items-center md:gap-12 lg:gap-24"
            >
              <div className="flex gap-5 sm:gap-8">
                <span
                  className="ds-code pt-1 text-muted-foreground"
                  aria-hidden="true"
                >
                  {scenario.number}
                </span>
                <div className="min-w-0">
                  <p className="ds-eyebrow mb-3 text-muted-foreground">
                    {scenario.eyebrow}
                  </p>
                  <h3 className="ds-title">{scenario.title}</h3>
                  <p className="ds-body mt-3 max-w-md text-muted-foreground">
                    {scenario.description}
                  </p>
                  <Button
                    asChild
                    variant="link"
                    className="mt-5 px-0 text-foreground"
                  >
                    <Link href={`/components/${scenario.slug}`}>
                      Explore {scenario.name.toLowerCase()}{" "}
                      <ArrowUpRight aria-hidden="true" className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="ds-inset min-w-0 px-3 pt-6 pb-3 sm:px-6">
                <div className="flex min-h-64 items-center">
                  <WidgetSpecimen
                    family={scenario.family}
                    layout={"layout" in scenario ? scenario.layout : undefined}
                  />
                </div>
                <p className="ds-caption border-t border-border px-4 py-3 text-center text-muted-foreground sm:px-0">
                  {scenario.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
        <p className="ds-caption mt-5 text-muted-foreground">
          All examples run locally. No feedback is sent or stored.
        </p>
      </div>
    </section>
  );
}

export function HowItWorksSection({
  analyticsEnabled,
}: {
  analyticsEnabled: boolean;
}) {
  return (
    <section
      id="how-it-works"
      aria-labelledby="integration-title"
      className="border-y border-border bg-muted/30"
    >
      <div className="ds-container ds-section grid gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="ds-eyebrow mb-4 text-muted-foreground">
            From registry to your repository
          </p>
          <h2
            id="integration-title"
            className="ds-section-title max-w-md text-balance"
          >
            Small integration.
            <br />
            Full ownership.
          </h2>
          <p className="ds-body mt-5 max-w-md text-muted-foreground">
            The component lives alongside the rest of your UI. You choose what
            it looks like and where the feedback goes.
          </p>
          <ol className="mt-9 max-w-md divide-y divide-border border-y border-border">
            {[
              {
                title: "Install the source",
                text: "One shadcn command adds readable React files and the UI primitives they use.",
              },
              {
                title: "Make it feel at home",
                text: "Your theme is the default. Change the copy, pick a layout, or compose the individual parts.",
              },
              {
                title: "Connect your backend",
                text: "Pass an async submit handler. Send reactions and optional comments to your existing API.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-4 py-5">
                <span className="ds-code pt-0.5 text-muted-foreground">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="ds-heading">{step.title}</h3>
                  <p className="ds-body-sm mt-1 text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <Button asChild variant="link" className="mt-4 px-0 text-foreground">
            <Link href="/components/getting-started">
              Follow the installation guide{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="min-w-0 space-y-4">
          <CodeBlock
            code={getUsageSnippet(
              widgetDocs[0]!,
              { showInput: true },
              "custom",
            )}
            label="feedback.tsx"
          />
          <div className="flex gap-3 px-1">
            <Braces
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-muted-foreground"
            />
            <p className="ds-caption leading-6 text-muted-foreground">
              Without a submit handler, feedback completes locally.{" "}
              <Link
                href={
                  analyticsEnabled
                    ? "/dashboard"
                    : "/components/getting-started#submission"
                }
                className="rounded-sm text-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
              >
                {analyticsEnabled
                  ? "Open the dashboard"
                  : "Explore your connection options"}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SystemSection() {
  return (
    <section aria-labelledby="system-title" className="ds-container ds-section">
      <div className="grid gap-10 md:grid-cols-2 md:gap-20">
        <div>
          <p className="ds-eyebrow mb-4 text-muted-foreground">
            Considered from the inside out
          </p>
          <h2
            id="system-title"
            className="ds-section-title max-w-md text-balance"
          >
            The details make it feel like yours.
          </h2>
          <p className="ds-body mt-5 max-w-md text-muted-foreground">
            A shared language for type, space, surfaces, and interaction. The
            same care, from a single reaction to the whole product.
          </p>
          <Button asChild variant="outline" className="mt-7">
            <Link href="/design-system">
              <Layers3 aria-hidden="true" className="size-4" />
              Explore the design system{" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
        <dl className="divide-y divide-border border-y border-border">
          {[
            {
              title: "A natural fit",
              detail:
                "Semantic shadcn tokens carry your colors, typography, and radius into the default widget.",
            },
            {
              title: "Every state considered",
              detail:
                "Visible focus, explicit submission, readable confirmation, and errors you can recover from.",
            },
            {
              title: "Room to make it your own",
              detail:
                "Two layouts, custom glyphs, and composable parts, with readable source when you want to go further.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="grid gap-2 py-6 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="ds-heading flex items-start gap-2">
                <Check
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-primary"
                />
                {item.title}
              </dt>
              <dd className="ds-body-sm text-muted-foreground">
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const questions = [
  {
    q: "Do I need an account to use the widgets?",
    a: "No. Browse, try, and install the widgets without an account.",
  },
  {
    q: "What do I need in my project?",
    a: "A React app with TypeScript, Tailwind CSS, and shadcn configured. The registry installs the widget source and its required shadcn components. In Astro, render it in a hydrated React island.",
  },
  {
    q: "Where does the feedback go?",
    a: "You choose. Pass a custom submit handler to send feedback to your API or database. Without one, the widget completes locally and stores nothing.",
  },
  {
    q: "Can I change the design?",
    a: "Yes. The widget follows your app’s shadcn theme. Adjust its design tokens, swap in your own glyphs, or compose a layout from its shared parts. Since the source is in your repository, you can edit it directly.",
  },
  {
    q: "Can I use this in a commercial project?",
    a: "Yes. The widget source is MIT licensed. You can use, modify, and distribute it under that license, including in commercial projects.",
  },
];

export function FaqSection() {
  return (
    <section
      aria-labelledby="questions-title"
      className="border-t border-border"
    >
      <div className="ds-container ds-section grid gap-8 lg:grid-cols-3 lg:gap-16">
        <div>
          <p className="ds-eyebrow mb-4 text-muted-foreground">
            A few useful answers
          </p>
          <h2 id="questions-title" className="ds-section-title">
            Before you ship.
          </h2>
          <Button
            asChild
            variant="link"
            className="mt-5 px-0 text-muted-foreground"
          >
            <a href={REPOSITORY_URL}>
              <Github aria-hidden="true" className="size-4" />
              Explore the source{" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </div>
        <Accordion
          type="single"
          collapsible
          className="border-t border-border lg:col-span-2"
        >
          {questions.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`}>
              <AccordionTrigger className="min-h-16 py-5 text-left">
                <span className="ds-heading">{item.q}</span>
              </AccordionTrigger>
              <AccordionContent className="ds-body-sm max-w-2xl pb-6 text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section
      aria-labelledby="get-started"
      className="border-t border-border bg-muted/40"
    >
      <div className="ds-container ds-section flex flex-col justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="ds-eyebrow mb-4 text-muted-foreground">
            Better products begin with listening
          </p>
          <h2 id="get-started" className="ds-section-title text-balance">
            Make your next release
            <br />a conversation.
          </h2>
        </div>
        <div>
          <Button asChild size="lg">
            <Link href="/components">
              Find your feedback widget{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <p className="ds-caption mt-3 text-muted-foreground">
            Open source. No account required.
          </p>
        </div>
      </div>
    </section>
  );
}
