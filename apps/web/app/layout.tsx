import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "@workspace/ui/globals.css";
import { ToasterProvider } from "./components/toaster-provider";
import { NavigationGuardProvider } from "nextjs-nav-guard";
import { SITE_URL } from "./_lib/widget-catalog";
import { ThemeProvider } from "./_components/theme-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sentimeter — Open-Source Feedback Widgets",
    template: "%s | Sentimeter",
  },
  description:
    "Accessible, open-code React feedback widgets for shadcn apps. Install the source and connect your own backend. No account required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body className={`${jakarta.variable} ${geistMono.variable} font-sans`}>
        {/* Mount before auth/data gates so history is guarded before Next handles it. */}
        <NavigationGuardProvider>
          <ThemeProvider>
            {children}
            <ToasterProvider />
          </ThemeProvider>
        </NavigationGuardProvider>
      </body>
    </html>
  );
}
