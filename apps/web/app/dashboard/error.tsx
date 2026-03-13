"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
        <div className="text-sm font-semibold">Something went wrong</div>
        <div className="mt-1 text-sm text-muted-foreground">
          An unexpected error occurred.
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
