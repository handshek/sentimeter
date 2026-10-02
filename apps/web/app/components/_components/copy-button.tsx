"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { copyText, type CopyTextResult } from "../../_lib/clipboard";

export function CopyButton({
  text,
  label = "Copy Code",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [result, setResult] = useState<CopyTextResult | null>(null);
  const [pending, setPending] = useState(false);
  const mounted = useRef(true);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copy() {
    setPending(true);
    const next = await copyText(text, navigator.clipboard);
    if (!mounted.current) return;
    setPending(false);
    setResult(next);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (next === "copied") {
      resetTimer.current = setTimeout(() => setResult(null), 1400);
    }
  }

  const copied = result === "copied";

  return (
    <div className="min-w-0">
      <Button
        type="button"
        variant="ghost"
        onClick={() => void copy()}
        disabled={pending}
        className={cn("h-11", className)}
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
      {result === "manual" ? (
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
