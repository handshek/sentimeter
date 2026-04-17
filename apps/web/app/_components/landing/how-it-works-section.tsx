"use client";

import { motion, useReducedMotion } from "motion/react";
import { STEPS } from "./data";
import { fadeUp, staggerContainer } from "./motion";

export function HowItWorksSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      className="relative px-6 py-24 md:py-32"
    >
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
            <motion.div key={step.number} variants={fadeUp} className="text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{step.title}</h3>
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
    </motion.section>
  );
}
