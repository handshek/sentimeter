import type { Metadata } from "next";
import { HeaderSection } from "../_components/landing/header-section";
import { FooterSection } from "../_components/landing/footer-section";
import { hasHostedConfiguration } from "../_lib/hosted-config";
import { SystemNavigation } from "./_components/system-navigation";

export const metadata: Metadata = {
  title: {
    default: "Design system",
    template: "%s · Design system | Sentimeter",
  },
  description:
    "The shared foundations, components, and patterns behind Sentimeter’s website, documentation, and feedback widgets.",
};

export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analyticsEnabled = hasHostedConfiguration();
  return (
    <div>
      <a
        href="#system-content"
        className="sr-only z-50 rounded-md bg-foreground px-4 py-3 text-background focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to design system content
      </a>
      <HeaderSection analyticsEnabled={analyticsEnabled} />
      <div className="ds-container grid items-start gap-8 py-8 lg:grid-cols-[208px_minmax(0,1fr)] lg:gap-14 lg:py-14">
        <aside className="min-w-0 lg:sticky lg:top-28">
          <SystemNavigation />
        </aside>
        <main
          id="system-content"
          tabIndex={-1}
          className="min-w-0 outline-none"
        >
          {children}
        </main>
      </div>
      <FooterSection analyticsEnabled={analyticsEnabled} />
    </div>
  );
}
