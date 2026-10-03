import Link from "next/link";
import {
  ArrowRight,
  Braces,
  Database,
  Palette,
  Keyboard,
  Github,
  Activity,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  widgetDocs,
  getUsageSnippet,
  REPOSITORY_URL,
} from "../../_lib/widget-catalog";
import { WidgetDemo } from "../../components/_components/widget-demo";
import { CodeBlock } from "../../components/_components/code-block";

const benefits = [
  {
    icon: Palette,
    title: "Your theme, not an iframe",
    description:
      "Uses your shadcn Button, Textarea, and design tokens. No foreign stylesheet fighting with your app.",
  },
  {
    icon: Keyboard,
    title: "The small details, handled",
    description:
      "Keyboard focus, 44px reaction targets, loading states, readable success, and retryable errors. Start from working UI.",
  },
  {
    icon: Database,
    title: "No backend lock-in",
    description:
      "Pass a submit handler and save feedback wherever you already store data. Hosted analytics is there if you want it.",
  },
];
const steps = [
  {
    number: "01",
    title: "Install",
    description:
      "Run one shadcn command. The widget and shared feedback system become readable files in your project.",
  },
  {
    number: "02",
    title: "Make It Yours",
    description:
      "Use a preset or compose your own. Change the copy, style, and placement—inline, in a popover, or in a dialog.",
  },
  {
    number: "03",
    title: "Connect",
    description:
      "Save reactions with your own submit handler. Or add a project key to use Sentimeter’s optional hosted dashboard.",
  },
];
const questions = [
  {
    q: "What is Sentimeter?",
    a: "An open-source registry of React feedback widgets for shadcn apps. Start with emoji, thumbs, or stars, install the source, and connect your backend. The hosted analytics dashboard is optional.",
  },
  {
    q: "Are the widgets free?",
    a: "Yes. The widget source is MIT licensed. You can use it in personal and commercial projects, modify it, and keep it in your own codebase.",
  },
  {
    q: "Do I own the installed code?",
    a: "Yes. The shadcn CLI copies the source into your project. There is no Sentimeter runtime package or hosted iframe to depend on. Edit the files like any other component in your app.",
  },
  {
    q: "What do I need in my app?",
    a: "React, TypeScript, Tailwind CSS, and a configured shadcn project. The widgets use your local Button, Textarea, and utilities. For Next.js, render them inside a client boundary; for Astro, use a hydrated React island.",
  },
  {
    q: "Where does feedback go?",
    a: "You choose. A custom submit handler can send it to your API or database. A publishable project key enables optional Sentimeter analytics when no custom handler is set. Without either, the widget runs locally and stores nothing.",
  },
  {
    q: "Can I customize the UI?",
    a: "Change the variant, size, labels, optional text input, and success message through props. Use the compound components for your own layout, or edit the installed source directly. Your app’s theme tokens supply the colors and typography.",
  },
];

export function BenefitsSection() {
  return (
    <section
      aria-labelledby="why-sentimeter"
      className="border-y border-border bg-muted/20"
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Less Plumbing. More Product.
          </p>
          <h2
            id="why-sentimeter"
            className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Feedback shouldn’t be a whole sprint.
          </h2>
          <p className="leading-7 text-muted-foreground">
            You need to know what users think. You don’t need another UI system,
            an embed, or a backend migration to ask.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="space-y-3">
              <Icon
                aria-hidden="true"
                className="mb-4 size-5 text-muted-foreground"
              />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function ShowcaseSection() {
  return (
    <section
      id="showcase"
      aria-labelledby="try-widgets"
      className="mx-auto max-w-6xl space-y-8 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            The Registry
          </p>
          <h2
            id="try-widgets"
            className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Small widgets. Real conversations.
          </h2>
          <p className="leading-7 text-muted-foreground">
            Three ways to ask. The same accessible foundation, styled by your
            app.
          </p>
        </div>
        <Button asChild variant="ghost" className="h-11">
          <Link href="/components">
            Explore the Docs{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {widgetDocs.map((widget) => (
          <section
            key={widget.slug}
            aria-labelledby={`showcase-${widget.slug}`}
            className="min-w-0 rounded-xl border border-border"
          >
            <div className="border-b border-border bg-muted/20 px-0 py-6 min-[360px]:px-2">
              <WidgetDemo
                widget={{
                  slug: widget.slug,
                  name: widget.name,
                  preview: widget.preview,
                  defaultVariant: widget.defaultVariant,
                }}
              />
            </div>
            <div className="space-y-3 p-5">
              <h3 id={`showcase-${widget.slug}`} className="font-semibold">
                {widget.name}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {widget.description}
              </p>
              <Button asChild variant="ghost" className="-ml-3 h-11">
                <Link href={`/components/${widget.slug}`}>
                  Preview & Install{" "}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Button>
            </div>
          </section>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        These demos run locally. Nothing is sent or stored.
      </p>
    </section>
  );
}
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="border-y border-border bg-muted/20"
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 sm:py-20">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            How It Works
          </p>
          <h2
            id="how-title"
            className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Install. Make it yours. Ship.
          </h2>
        </div>
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="space-y-3">
              <span className="font-mono text-sm text-muted-foreground">
                {step.number}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        <Button asChild variant="outline" className="h-11">
          <Link href="/components/getting-started">
            Follow the Installation Guide{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
export function OwnershipSection() {
  return (
    <section
      aria-labelledby="own-the-code"
      className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16"
    >
      <div className="space-y-5">
        <Braces aria-hidden="true" className="size-6 text-muted-foreground" />
        <h2
          id="own-the-code"
          className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          It’s your component now.
        </h2>
        <p className="leading-7 text-muted-foreground">
          Not an opaque dependency. Not a widget with somebody else’s branding.
          Just React source that belongs alongside the rest of your app.
        </p>
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li>Use emoji or icons. Add optional text. Change every label.</li>
          <li>
            Keep a ready-made preset or build your layout with the compound
            components.
          </li>
          <li>Bring your own API, database, and deployment.</li>
        </ul>
        <Button asChild variant="outline" className="h-11">
          <Link href="/components/emoji-feedback">
            See the Props & Examples{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
      <CodeBlock
        code={getUsageSnippet(widgetDocs[0]!, {
          variant: "icons",
          showInput: true,
        })}
        label="Make It Yours"
      />
    </section>
  );
}
export function IntegrationSection({
  analyticsEnabled,
}: {
  analyticsEnabled: boolean;
}) {
  return (
    <section
      aria-labelledby="integrations"
      className="border-y border-border bg-muted/20"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:gap-16">
        <div className="space-y-4">
          <Activity
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Optional Hosted Analytics
          </p>
          <h2
            id="integrations"
            className="text-balance text-2xl font-semibold tracking-tight"
          >
            Want the dashboard too?
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Keep the open-source widgets. Add a publishable project key to
            collect responses in Sentimeter, watch sentiment trends, and read
            the live feedback feed. Configure allowed origins for production.
          </p>
          <Button asChild variant="outline" className="h-11">
            <Link
              href={
                analyticsEnabled
                  ? "/dashboard"
                  : "/components/getting-started#submission"
              }
            >
              {analyticsEnabled
                ? "Explore Analytics"
                : "Read Integration Guidance"}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          <Braces aria-hidden="true" className="size-5 text-muted-foreground" />
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            For You & Your Agent
          </p>
          <h2 className="text-balance text-2xl font-semibold tracking-tight">
            Docs your tools can read.
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Every widget has Markdown docs with exact install commands, props,
            and integration examples. Add the registry namespace to use shadcn’s
            existing MCP tooling. No extra Sentimeter server to configure.
          </p>
          <Button asChild variant="outline" className="h-11">
            <Link href="/components/getting-started#agents">
              Agent Setup <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
export function FaqSection() {
  return (
    <section
      aria-labelledby="faq"
      className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.5fr] lg:gap-16"
    >
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          FAQ
        </p>
        <h2 id="faq" className="text-3xl font-semibold tracking-tight">
          A few good questions.
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Still curious? The source is open.
        </p>
        <Button asChild variant="ghost" className="-ml-3 h-11">
          <a href={REPOSITORY_URL}>
            <Github aria-hidden="true" className="size-4" />
            View on GitHub
          </a>
        </Button>
      </div>
      <Accordion type="single" collapsible>
        {questions.map((item, index) => (
          <AccordionItem key={item.q} value={`faq-${index}`}>
            <AccordionTrigger className="min-h-14 text-left">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-7 text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
export function CtaSection() {
  return (
    <section
      aria-labelledby="get-started"
      className="border-t border-border bg-muted/20 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-6xl space-y-5">
        <h2
          id="get-started"
          className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Ask a better question. Ship a better product.
        </h2>
        <p className="max-w-xl leading-7 text-muted-foreground">
          Pick a widget. Install the code. Start listening.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="h-11 px-5">
            <Link href="/components">
              Browse Widgets{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-5">
            <Link href="/components/getting-started">Getting Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
