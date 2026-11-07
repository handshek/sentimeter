"use client";

import { useEffect, useRef, useState } from "react";
import { copyText, type CopyTextResult } from "@/lib/clipboard";

export type CopyStatus = "idle" | "copying" | CopyTextResult;

type Feedback = { text: string; status: CopyStatus; copyId: number };

export function useCopyFeedback(text: string, resetAfterMs = 1400) {
  const [last, setLast] = useState<Feedback>({
    text,
    status: "idle",
    copyId: 0,
  });
  const copyCount = useRef(0);
  const mounted = useRef(true);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Feedback describes the text it was produced for. Dropping it on a text
  // change also drops any copy still in flight, so it cannot return later.
  if (last.text !== text) setLast({ text, status: "idle", copyId: 0 });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function settle(copyId: number, status: CopyStatus) {
    setLast((current) =>
      current.copyId === copyId ? { ...current, status } : current,
    );
  }

  async function copy() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    const copyId = ++copyCount.current;
    setLast({ text, status: "copying", copyId });
    const result = await copyText(text, navigator.clipboard);
    if (!mounted.current) return;
    settle(copyId, result);
    if (result === "copied") {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(
        () => settle(copyId, "idle"),
        resetAfterMs,
      );
    }
  }

  return { status: last.status, copy };
}
