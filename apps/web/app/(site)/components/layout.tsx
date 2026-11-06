import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { docsTree } from "@/lib/docs-navigation";
import { DocsHeader } from "@/components/docs/docs-header";
import { FooterSection } from "@/components/landing/footer-section";
import { hostedMode } from "@/lib/hosted-config";
import "./docs.css";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RootProvider
      theme={{ enabled: false }}
      search={{ options: { api: "/components/search" } }}
    >
      <div className="docs-shell bg-background text-foreground">
        <a
          href="#nd-page"
          className="sr-only fixed left-4 top-4 z-60 rounded-md bg-background p-3 focus:not-sr-only focus-visible:outline-2 focus-visible:outline-ring"
        >
          Skip to Content
        </a>
        <DocsLayout
          tree={docsTree}
          nav={{ mode: "top" }}
          slots={{ header: DocsHeader }}
          sidebar={{ collapsible: false }}
        >
          {children}
        </DocsLayout>
        <FooterSection hostedMode={hostedMode()} />
      </div>
    </RootProvider>
  );
}
