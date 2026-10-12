"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="ds-panel p-6">
        <div className="ds-title">Something went wrong</div>
        <div className="ds-body mt-3 text-muted-foreground">
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
