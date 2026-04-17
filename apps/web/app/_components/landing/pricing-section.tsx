"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { PRICING } from "./data";
import { fadeUp, staggerContainer } from "./motion";

export function PricingSection({ dashboardHref }: { dashboardHref: string }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      className="relative px-6 py-24 md:py-32"
    >
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
          Install and use every widget at no cost. Add analytics when you&apos;re
          ready - starting at less than a coffee.
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
                      <li key={feature} className="flex items-center gap-3 text-[15px]">
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
    </motion.section>
  );
}
