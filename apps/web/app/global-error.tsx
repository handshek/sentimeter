"use client";

import ErrorPage from "./error";
import { ThemeProvider } from "@/components/theme-provider";
import { geistSans, geistMono } from "@/lib/fonts";
import "@workspace/ui/globals.css";

export default function GlobalError(props: Parameters<typeof ErrorPage>[0]) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ErrorPage {...props} />
        </ThemeProvider>
      </body>
    </html>
  );
}
