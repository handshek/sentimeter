"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { joinWaitlist } from "../../_lib/waitlist";
import type { WaitlistFormState } from "../../_lib/waitlist-request";

const messages: Record<WaitlistFormState, string> = {
  idle: "We'll email you when hosted analytics is ready.",
  ok: "You're on the list. We'll email you when it's ready.",
  invalid: "Enter a valid email address.",
  rate_limited: "Too many attempts. Try again in an hour.",
  unavailable: "We couldn't save your email. Please try again.",
};

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, "idle");
  const [email, setEmail] = useState("");
  const id = useId();
  const statusId = `${id}-status`;
  const failed =
    state === "invalid" || state === "rate_limited" || state === "unavailable";

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${id}-email`}>Email address</Label>
        <Input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={pending || state === "ok"}
          aria-invalid={state === "invalid" || undefined}
          aria-describedby={statusId}
          placeholder="you@example.com"
        />
      </div>
      <div className="hidden" aria-hidden="true">
        <Label htmlFor={`${id}-website`}>Website</Label>
        <Input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <Button type="submit" disabled={pending || state === "ok"}>
        {pending ? "Joining…" : state === "ok" ? "Joined" : "Join the waitlist"}
      </Button>
      <p
        id={statusId}
        role="status"
        className={`ds-body-sm flex min-h-12 items-start gap-2 ${
          state === "ok"
            ? "text-success"
            : failed
              ? "text-destructive"
              : "text-muted-foreground"
        }`}
      >
        {state === "ok" && (
          <Check aria-hidden="true" className="mt-1 size-4 shrink-0" />
        )}
        {pending ? "Saving your email…" : messages[state]}
      </p>
      <p className="ds-body-sm text-muted-foreground">
        We store your email in Convex for launch updates.{" "}
        <Link
          href="/privacy"
          className="rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
        >
          Privacy policy
        </Link>
        .
      </p>
    </form>
  );
}
