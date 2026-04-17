"use client";

import Link from "next/link";

export function FooterSection() {
  return (
    <footer className="border-t border-border/40 px-6 py-12 text-center text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p>&copy; 2026 Sentimeter. Built for developers.</p>
        <div className="flex items-center gap-6">
          <Link href="#" className="transition-colors hover:text-foreground">
            Documentation
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
