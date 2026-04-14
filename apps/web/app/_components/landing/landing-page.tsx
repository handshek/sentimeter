"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  Check,
  LayoutDashboard,
  Layers,
  Package,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Button } from "@workspace/ui/components/button";
import {
  FAQ_ITEMS,
  HERO_PHRASES,
  PAIN_POINTS,
  PRICING,
  SHOWCASE_WIDGETS,
  STEPS,
} from "./data";
import { DemoWidget } from "./demo-widget";
import { fadeUp, staggerContainer } from "./motion";
import { Section } from "./section";

function useTextRotator(phrases: string[], intervalMs = 3000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [phrases.length, intervalMs]);

  return phrases[index]!;
}

export function LandingPage() {
  const { isSignedIn } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const currentPhrase = useTextRotator(HERO_PHRASES);
  const dashboardHref = isSignedIn ? "/dashboard" : "/sign-in";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent_50%)]" />

      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="text-xl font-bold tracking-tight">Sentimeter</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link href={dashboardHref}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>

            <Button size="sm" asChild className="rounded-lg">
              <Link href="/components">
                <Package className="mr-2 h-4 w-4" />
                Browse Components
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative flex flex-col items-center px-6 pt-24 pb-20 text-center md:pt-32 md:pb-24">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mx-auto flex max-w-3xl flex-col items-center"
        >
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-semibold text-primary">
            <Layers className="h-3.5 w-3.5" />
            shadcn-native widgets
          </div>

          <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Feedback widgets that
            </span>
            <br />
            <em className="text-primary italic">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentPhrase}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {currentPhrase}
                </motion.span>
              </AnimatePresence>
            </em>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            shadcn-native components you install with one command. Collect
            reactions, ship analytics, own every line of code.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="h-11 rounded-xl px-7 text-[15px] shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              <Link href="/components">
                <Package className="mr-2 h-4 w-4" />
                Browse Components
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-11 rounded-xl px-7 text-[15px] transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <Link href={dashboardHref}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

        </motion.div>
      </section>

      <Section muted>
        <div className="mx-auto max-w-4xl">
          <motion.div variants={fadeUp} className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Sound familiar?
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Feedback shouldn&apos;t be a whole sprint
            </h2>
          </motion.div>

          <div className="mx-auto grid max-w-3xl gap-5">
            {PAIN_POINTS.map((pain) => (
              <motion.div
                key={pain.title}
                variants={fadeUp}
                className="flex items-start gap-5 rounded-2xl border border-border/60 bg-background px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {pain.icon}
                </span>
                <div>
                  <h3 className="text-base font-bold">{pain.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                    {pain.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-4xl">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Three steps. That&apos;s it.
            </h2>
          </motion.div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="text-center"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
                  {step.number}
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {step.code && (
                  <div className="mt-3 inline-block rounded-md bg-zinc-950 px-4 py-2 font-mono text-xs text-zinc-300">
                    {step.code}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section muted id="showcase">
        <div className="mx-auto max-w-5xl">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Try them out
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Widgets that feel like yours
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
              Installed into your codebase. Styled by your theme. Editable
              forever.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SHOWCASE_WIDGETS.map((widget) => (
              <motion.div key={widget.kind} variants={fadeUp}>
                <DemoWidget kind={widget.kind} label={widget.label} />
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-14 text-center text-sm text-muted-foreground"
          >
            Fully customizable. You own the code.{" "}
            <Link
              href="/components"
              className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
            >
              Browse all components &rarr;
            </Link>
          </motion.p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <motion.div variants={fadeUp} className="mb-4 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Pricing
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Widgets are free. Analytics are cheap.
            </h2>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mx-auto mb-14 max-w-md text-center text-base text-muted-foreground"
          >
            Install and use every widget at no cost. Add analytics when
            you&apos;re ready - starting at less than a coffee.
          </motion.p>

          <div className="grid gap-6 sm:grid-cols-2">
            {PRICING.map((plan) => (
              <motion.div key={plan.name} variants={fadeUp}>
                <div
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 ${
                    plan.featured
                      ? "border-primary/60 shadow-xl shadow-primary/10"
                      : "border-border/60 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                  }`}
                >
                  {plan.featured && (
                    <>
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.1),transparent_60%)]" />
                      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />
                    </>
                  )}

                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25">
                        Best Value
                      </span>
                    </div>
                  )}

                  <div className="relative flex flex-1 flex-col px-7 pt-9 pb-7">
                    <p className="text-sm font-semibold text-muted-foreground">
                      {plan.name}
                    </p>

                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-5xl font-extrabold tracking-tighter">
                        {plan.price}
                      </span>
                      <span className="text-base font-medium text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>

                    <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                      {plan.description}
                    </p>

                    <div className="my-6 h-px bg-border/60" />

                    <ul className="flex-1 space-y-3.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-3 text-[15px]"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-3 w-3 text-primary" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`mt-8 w-full rounded-xl py-5 text-[15px] font-semibold transition-all ${
                        plan.featured
                          ? "shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
                          : "hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                      }`}
                      variant={plan.featured ? "default" : "outline"}
                      asChild
                    >
                      <Link href={dashboardHref}>{plan.cta}</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section muted>
        <div className="mx-auto max-w-2xl">
          <motion.div variants={fadeUp} className="mb-12 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Questions? Answered.
            </h2>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-[15px]">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </Section>

      <Section>
        <motion.div
          variants={fadeUp}
          className="mx-auto max-w-xl text-center"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            Ready?
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Start collecting feedback
            <br />
            in under two minutes
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Pick a widget. Run one command. Ship it today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="h-12 rounded-xl px-8 text-[15px] shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              <Link href="/components">
                <Package className="mr-2 h-4 w-4" />
                Browse Components
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 rounded-xl px-8 text-[15px] transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <Link href={dashboardHref}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </Section>

      <footer className="border-t border-border/40 px-6 py-12 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>&copy; 2026 Sentimeter. Built for developers.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-foreground">
              Documentation
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
