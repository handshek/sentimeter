"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { fadeUp, staggerContainer } from "./motion";

export function CtaSection({ dashboardHref }: { dashboardHref: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      className="relative px-6 py-24 md:py-32"
    >
      <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center">
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
    </motion.section>
  );
}
