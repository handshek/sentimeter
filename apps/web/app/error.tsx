"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { HeaderSection } from "@/components/landing/header-section";
import { FooterSection } from "@/components/landing/footer-section";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderSection hostedMode="off" />
      <main className="ds-container ds-section">
        <Card className="ds-reading mx-auto">
          <CardContent className="space-y-6 p-(--ds-panel-inset)">
            <p className="ds-eyebrow text-muted-foreground">
              Something went wrong
            </p>
            <h1 className="ds-page-title">We couldn&apos;t load this page</h1>
            <p className="ds-body text-muted-foreground">
              Try again, or return to the widget collection.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={reset}>Try again</Button>
              <Button asChild variant="outline">
                <Link href="/components">Browse widgets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <FooterSection hostedMode="off" />
    </div>
  );
}
