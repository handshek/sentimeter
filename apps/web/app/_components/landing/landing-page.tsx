import { HeaderSection } from "./header-section";
import { FooterSection } from "./footer-section";
import { HeroSection } from "./hero-section";
import {
  ShowcaseSection,
  HowItWorksSection,
  SystemSection,
  FaqSection,
  CtaSection,
} from "./product-sections";

export function LandingPage({
  analyticsEnabled,
}: {
  analyticsEnabled: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only fixed top-4 left-4 z-60 rounded-md bg-background p-3 focus:not-sr-only focus-visible:outline-2 focus-visible:outline-ring"
      >
        Skip to content
      </a>
      <HeaderSection analyticsEnabled={analyticsEnabled} />
      <main id="main" className="flex-1 [&_section[id]]:scroll-mt-24">
        <HeroSection />
        <ShowcaseSection />
        <HowItWorksSection analyticsEnabled={analyticsEnabled} />
        <SystemSection />
        <FaqSection />
        <CtaSection />
      </main>
      <FooterSection analyticsEnabled={analyticsEnabled} />
    </div>
  );
}
