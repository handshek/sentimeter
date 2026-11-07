import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { geistSans, geistMono } from "@/lib/fonts";
import "@workspace/ui/globals.css";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { NavigationGuardProvider } from "nextjs-nav-guard";
import { SITE_URL } from "@/lib/widget-catalog";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sentimeter: feedback components for shadcn/ui and React",
    template: "%s | Sentimeter",
  },
  description:
    "Open-source feedback components for React and shadcn/ui: a feedback button, report-a-problem form, ratings, NPS and a cancellation survey. Install the source with the shadcn CLI and save to your own backend.",
  openGraph: {
    type: "website",
    siteName: "Sentimeter",
    title: "Sentimeter: feedback components for shadcn/ui and React",
    description:
      "Let users tell you what broke in seconds. Open-source feedback components that install as code into your shadcn/ui app.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentimeter: feedback components for shadcn/ui and React",
    description:
      "Let users tell you what broke in seconds. Open-source feedback components that install as code into your shadcn/ui app.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        {/* Mount before auth/data gates so history is guarded before Next handles it. */}
        <NavigationGuardProvider>
          <ThemeProvider>
            {children}
            <ToasterProvider />
          </ThemeProvider>
        </NavigationGuardProvider>
        <Analytics />
      </body>
    </html>
  );
}
