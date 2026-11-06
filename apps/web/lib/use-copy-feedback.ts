"use client";

import { useEffect, useRef, useState } from "react";
import { copyText, type CopyTextResult } from "@/lib/clipboard";

export type CopyStatus = "idle" | "copying" | CopyTextResult;

// The status belongs to the text it was produced for, so it reads as idle
// once the caller's text changes, with no effect to keep them in step.
export function useCopyFeedback(text: string, resetAfterMs = 1400) {
  const [last, setLast] = useState<{ text: string; status: CopyStatus }>({
    text,
    status: "idle",
  });
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
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setLast({ text, status: "copying" });
    const result = await copyText(text, navigator.clipboard);
    if (!mounted.current) return;
    setLast({ text, status: result });
    if (result === "copied") {
      resetTimer.current = setTimeout(
        () => setLast((current) => ({ ...current, status: "idle" })),
        resetAfterMs,
      );
    }
  }

  return { status: last.text === text ? last.status : "idle", copy };
}
