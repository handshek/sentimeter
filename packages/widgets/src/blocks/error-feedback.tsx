"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { FeedbackForm } from "../feedback-form";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-2">
        <TriangleAlert
          aria-hidden="true"
          className="size-5 text-muted-foreground"
        />
        <h1 className="text-lg font-semibold">Something broke on our side.</h1>
        <p className="text-sm text-muted-foreground">
          Try again, or tell us what you were doing so we can fix it.
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
      {/* The digest matches this error in your server logs; the message and
          stack stay out of the report. Add `submit` to send it. */}
      <FeedbackForm
        title="What were you trying to do?"
        placeholder="I was exporting my invoices when…"
        location={error.digest ? `error:${error.digest}` : "error"}
        className="text-left"
      />
    </main>
  );
}
