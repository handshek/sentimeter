"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { useCopyFeedback } from "@/lib/use-copy-feedback";

export function CopyButton({
  text,
  label = "Copy Code",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const { status, copy } = useCopyFeedback(text);

  const copied = status === "copied";

  return (
    <div className="min-w-0">
      <Button
        type="button"
        variant="ghost"
        onClick={() => void copy()}
        disabled={status === "copying"}
        className={cn("", className)}
      >
        {copied ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Copy className="size-4" aria-hidden="true" />
        )}
        {copied ? "Copied" : label}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? `${label.replace(/^Copy /, "")} copied to clipboard.` : ""}
      </span>
      {status === "manual" ? (
        <div role="alert" className="mt-2 space-y-2 text-sm">
          <p>Clipboard unavailable. Select and copy the text below.</p>
          <Textarea
            readOnly
            value={text}
            aria-label={`${label} manually`}
            spellCheck={false}
            className="max-h-48 font-mono text-xs"
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      ) : null}
    </div>
  );
}
