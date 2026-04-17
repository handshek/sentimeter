"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { SHOWCASE_WIDGETS } from "./data";
import { DemoWidget } from "./demo-widget";
import { fadeUp, staggerContainer } from "./motion";

export function ShowcaseSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      id="showcase"
      className="relative bg-muted/30 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <motion.div variants={fadeUp} className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            Try them out
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Widgets that feel like yours
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted-foreground">
            Installed into your codebase. Styled by your theme. Editable forever.
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
    </motion.section>
  );
}
