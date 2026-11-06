"use client";

import { useEffect, useRef, useState } from "react";
import type { WidgetState } from "@workspace/widgets";

// A replay remounts the widget under a new key, so the mirrored state starts
// over in the same update instead of in a second setter.
export function useWidgetReplay() {
  const [run, setRun] = useState<{ key: number; state: WidgetState }>({
    key: 0,
    state: "idle",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const focusAfterReplay = useRef(false);

  useEffect(() => {
    if (!focusAfterReplay.current) return;
    focusAfterReplay.current = false;
    containerRef.current
      ?.querySelector<HTMLButtonElement>("button[aria-pressed]")
      ?.focus();
  }, [run.key]);

  return {
    key: run.key,
    state: run.state,
    containerRef,
    onStateChange: (state: WidgetState) =>
      setRun((current) => ({ ...current, state })),
    replay: () => {
      focusAfterReplay.current = true;
      setRun((current) => ({ key: current.key + 1, state: "idle" }));
    },
  };
}
