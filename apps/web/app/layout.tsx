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
    default: "Sentimeter — Open-Source Feedback Widgets",
    template: "%s | Sentimeter",
  },
  description:
    "Accessible, open-code React feedback widgets for shadcn apps. Install the source and connect your own backend. No account required.",
  openGraph: {
    type: "website",
    siteName: "Sentimeter",
    title: "Sentimeter | Feedback widgets for shadcn apps",
    description:
      "Accessible, open-source React feedback widgets. Install the source and connect your own backend.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentimeter | Feedback widgets for shadcn apps",
    description:
      "Accessible, open-source React feedback widgets. Install the source and connect your own backend.",
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
