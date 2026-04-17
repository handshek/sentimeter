"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { FAQ_ITEMS } from "./data";
import { fadeUp, staggerContainer } from "./motion";

export function FaqSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      className="relative bg-muted/30 px-6 py-24 md:py-32"
    >
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
                  <p className="leading-relaxed text-muted-foreground">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </motion.section>
  );
}
