"use client";

import * as React from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { FeedbackForm, type FeedbackFormProps } from "../feedback-form";

const corners = {
  "bottom-right": "right-4 bottom-4",
  "bottom-left": "bottom-4 left-4",
} as const;

const phoneQuery = "(max-width: 639px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(phoneQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// A bottom sheet keeps the text box above the phone keyboard; a popover
// stays out of the way on larger screens.
function useIsPhone() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(phoneQuery).matches,
    () => false,
  );
}

export type FloatingFeedbackProps = Pick<
  FeedbackFormProps,
  "submit" | "location"
> & {
  corner?: keyof typeof corners;
  label?: string;
};

export function FloatingFeedback({
  submit,
  location = "floating-feedback",
  corner = "bottom-right",
  label = "Feedback",
}: FloatingFeedbackProps) {
  const [open, setOpen] = React.useState(false);
  const phone = useIsPhone();

  const trigger = (
    <Button
      variant="outline"
      className={cn("fixed z-40 rounded-full shadow-md", corners[corner])}
    >
      <MessageSquareText aria-hidden="true" />
      {label}
    </Button>
  );
  const form = (
    <FeedbackForm
      submit={submit}
      location={location}
      onDone={() => setOpen(false)}
      className={phone ? "max-w-none bg-transparent shadow-none" : undefined}
    />
  );

  if (phone) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">Send feedback</SheetTitle>
          {form}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="top"
        align={corner === "bottom-left" ? "start" : "end"}
        sideOffset={12}
        className="w-[min(23rem,calc(100vw-2rem))] border-0 bg-transparent p-0 shadow-none"
      >
        {form}
      </PopoverContent>
    </Popover>
  );
}
