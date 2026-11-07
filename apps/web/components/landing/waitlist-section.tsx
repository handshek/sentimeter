import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function WaitlistSection() {
  return (
    <section
      aria-labelledby="waitlist-title"
      className="flex flex-col items-start justify-between gap-6 rounded-2xl border p-6 sm:flex-row sm:items-center sm:p-8"
    >
      <div className="space-y-1.5">
        <p className="ds-caption flex items-center gap-1.5 font-mono text-muted-foreground">
          <Inbox aria-hidden="true" className="size-3.5" />
          Coming later · hosted inbox
        </p>
        <h2 id="waitlist-title" className="ds-title">
          Want an inbox that replies for you?
        </h2>
        <p className="ds-body-sm text-muted-foreground">
          Collect every report in one place and tell users when it’s fixed.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard">
          Join the waitlist <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </Button>
    </section>
  );
}
