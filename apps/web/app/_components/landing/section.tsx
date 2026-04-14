"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { staggerContainer } from "./motion";

export function Section({
  children,
  className = "",
  muted = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  id?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer}
      id={id}
      className={`relative px-6 py-24 md:py-32 ${muted ? "bg-muted/30" : ""} ${className}`}
    >
      {children}
    </motion.section>
  );
}
