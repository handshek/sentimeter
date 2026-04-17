"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Layers } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function HeroSection({
  dashboardHref,
  prefersReducedMotion,
}: {
  dashboardHref: string;
  prefersReducedMotion: boolean;
}) {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-30 md:pb-24">
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative mx-auto w-full max-w-6xl"
      >
        <div className="relative z-10 md:w-1/2">
          <div className="mb-7 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-semibold text-primary">
            <Layers className="h-3.5 w-3.5" />
            shadcn-native widgets
          </div>

          <h1 className="text-5xl leading-[0.96] font-black text-gray-800 tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Collect user feedback
            <br />
            with zero friction
          </h1>

          <p className="mt-6 max-w-lg text-[19px] leading-relaxed text-muted-foreground">
            Drop-in feedback widgets that seamlessly fit in your app. Capture
            reactions, track sentiment in real time, and own every line of code.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="h-12 rounded-xl px-7 text-[15px] shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              <Link href="/components">Browse Components</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 rounded-xl px-7 text-[15px] transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <Link href={dashboardHref}>Go to Dashboard</Link>
            </Button>
          </div>

          <div className="mt-10">
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
              Works across the modern React ecosystem:
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-3 text-[15px] font-semibold text-foreground/75">
              <span>Next.js</span>
              <span>React Router v7</span>
              <span>Vite</span>
              <span>Astro + React</span>
            </div>
          </div>
        </div>

        <div className="perspective-near mt-16 translate-x-8 md:absolute md:top-0 md:-right-16 md:bottom-0 md:left-1/2 md:mt-0 md:translate-x-0">
          <div className="relative h-full before:absolute before:-inset-x-4 before:top-0 before:bottom-7 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border before:border-foreground/5 before:bg-foreground/5">
            <div className="relative h-full -translate-y-6 skew-x-6 overflow-hidden rounded-lg border border-transparent bg-background shadow-md shadow-foreground/10 ring-1 ring-foreground/5">
              <div className="flex h-full min-h-[460px] items-center justify-center bg-muted/40 text-sm text-muted-foreground">
                Dashboard preview
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
