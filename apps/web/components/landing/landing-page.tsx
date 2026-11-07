import { HeaderSection } from "./header-section";
import { FooterSection } from "./footer-section";
import { HeroSection } from "./hero-section";
import { DirectoryGroups } from "./directory-groups";
import { WaitlistSection } from "./waitlist-section";
import type { HostedMode } from "@/lib/hosted-config";

export function LandingPage({ hostedMode }: { hostedMode: HostedMode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main"
        className="sr-only fixed top-4 left-4 z-60 rounded-md bg-background p-3 focus:not-sr-only focus-visible:outline-2 focus-visible:outline-ring"
      >
        Skip to content
      </a>
      <HeaderSection />
      <main id="main" className="flex-1 [&_section[id]]:scroll-mt-24">
        <HeroSection />
        <div className="ds-container flex flex-col gap-16 py-16 sm:py-20">
          <DirectoryGroups />
          {hostedMode === "waitlist" && <WaitlistSection />}
        </div>
      </main>
      <FooterSection hostedMode={hostedMode} />
    </div>
  );
}
