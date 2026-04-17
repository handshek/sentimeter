"use client";

import { motion, useReducedMotion } from "motion/react";
import { PAIN_POINTS } from "./data";
import { fadeUp, staggerContainer } from "./motion";

export function PainPointsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      className="relative bg-muted/30 px-6 py-24 md:py-32"
    >
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
    </motion.section>
  );
}
