"use client";

import { useAuth } from "@clerk/nextjs";
import { useReducedMotion } from "motion/react";
import { CtaSection } from "./cta-section";
import { FaqSection } from "./faq-section";
import { FooterSection } from "./footer-section";
import { HeaderSection } from "./header-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { PainPointsSection } from "./pain-points-section";
import { PricingSection } from "./pricing-section";
import { ShowcaseSection } from "./showcase-section";

export function LandingPage() {
  const { isSignedIn } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const dashboardHref = isSignedIn ? "/dashboard" : "/sign-in";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent_50%)]" />
      <HeaderSection dashboardHref={dashboardHref} />
      <HeroSection
        dashboardHref={dashboardHref}
        prefersReducedMotion={!!prefersReducedMotion}
      />
      <PainPointsSection />
      <HowItWorksSection />
      <ShowcaseSection />
      <PricingSection dashboardHref={dashboardHref} />
      <FaqSection />
      <CtaSection dashboardHref={dashboardHref} />
      <FooterSection />
    </div>
  );
}
