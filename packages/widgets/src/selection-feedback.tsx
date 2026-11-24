"use client";

import * as React from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Flag, PencilLine } from "lucide-react";
import {
  FeedbackFormActions,
  FeedbackResponse,
  FeedbackTextField,
  feedbackStyles,
  feedbackTheme,
  useFeedbackSubmission,
  type FeedbackStyle,
  type SelectionPayload,
  type WidgetCallbacks,
  type WidgetSubmit,
} from "./feedback-system";

export const SELECTION_QUOTE_MAX_LENGTH = 1000;
const GAP = 8;
const EDGE = 8;
const TOOLBAR_HEIGHT = 40;

type Rect = { top: number; bottom: number; left: number; width: number };

export type ReadSelection = { quote: string; rect: Rect; range: Range };

const IGNORED =
  "input,textarea,select,[contenteditable]:not([contenteditable=false]),[data-slot^=feedback-]";

function elementOf(node: Node | null) {
  return node instanceof Element ? node : (node?.parentElement ?? null);
}

function rectOf(range: Range, fallback: Element): Rect {
  const box = range.getBoundingClientRect?.();
  if (box && (box.width || box.height)) return box;
  const rects = range.getClientRects?.();
  const last = rects && rects.length ? rects[rects.length - 1] : undefined;
  return last ?? fallback.getBoundingClientRect();
}

/**
 * Returns the quote and position for a selection that sits wholly inside
 * `container`, or null when there is nothing to comment on.
 */
export function readSelection(
  container: Element,
  selection: Selection | null,
): ReadSelection | null {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }
  const range = selection.getRangeAt(0);
  const common = elementOf(range.commonAncestorContainer);
  if (!common || !container.contains(common)) return null;
  for (const node of [range.startContainer, range.endContainer]) {
    const element = elementOf(node);
    if (!element || element.closest(IGNORED)) return null;
  }
  const quote = selection.toString().replace(/\s+/g, " ").trim();
  if (!quote) return null;
  return {
    quote:
      quote.length > SELECTION_QUOTE_MAX_LENGTH
        ? `${quote.slice(0, SELECTION_QUOTE_MAX_LENGTH - 1)}…`
        : quote,
    rect: rectOf(range, container),
    range: range.cloneRange(),
  };
}

/** Places a floating panel above the selection, or below near the top. */
export function placeNear(
  rect: Rect,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  preferBelow = false,
) {
  const above = rect.top - GAP - size.height;
  const below = rect.bottom + GAP;
  const fitsAbove = above >= EDGE;
  const fitsBelow = below + size.height <= viewport.height - EDGE;
  const top =
    (preferBelow && fitsBelow) || !fitsAbove
      ? Math.min(below, viewport.height - EDGE - size.height)
      : above;
  const centre = rect.left + rect.width / 2 - size.width / 2;
  const left = Math.min(
    Math.max(EDGE, centre),
    Math.max(EDGE, viewport.width - EDGE - size.width),
  );
  return { top: Math.max(EDGE, top), left };
}

export type SelectionFeedbackProps = {
  children: React.ReactNode;
  location?: string;
  editLabel?: string;
  reportLabel?: string;
  thankYouMessage?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: FeedbackStyle;
  submit?: WidgetSubmit<SelectionPayload>;
} & Pick<
  WidgetCallbacks<SelectionPayload>,
  "onStateChange" | "onSubmitStart" | "onSubmitSuccess" | "onSubmitError"
>;

/**
 * Wraps docs or an answer. Selecting text shows a small Suggest edit / Report
 * toolbar; the note opens with the quote attached.
 */
export function SelectionFeedback({
  children,
  location = "/",
  editLabel = "Suggest edit",
  reportLabel = "Report",
  thankYouMessage = "Thanks. We'll take a look.",
  disabled = false,
  className,
  style,
  submit,
  ...callbacks
}: SelectionFeedbackProps) {
  const machine = useFeedbackSubmission({ submit, ...callbacks });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [picked, setPicked] = React.useState<ReadSelection | null>(null);
  const [kind, setKind] = React.useState<"edit" | "report" | null>(null);
  const [text, setText] = React.useState("");
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
  }>();
  const errorId = React.useId();
  const kindRef = React.useRef(kind);
  kindRef.current = kind;

  const close = React.useCallback(() => {
    setPicked(null);
    setKind(null);
    setText("");
    machine.clearError();
    machine.setStateSafe("idle");
  }, [machine]);

  // The toolbar follows the live selection until a note is open.
  React.useEffect(() => {
    if (disabled) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (kindRef.current || !containerRef.current) return;
        setPicked(readSelection(containerRef.current, document.getSelection()));
      });
    };
    document.addEventListener("selectionchange", update);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("selectionchange", update);
    };
  }, [disabled]);

  React.useLayoutEffect(() => {
    if (!picked) return;
    const place = () => {
      const panel = panelRef.current;
      const rect = picked.range.getBoundingClientRect?.();
      const anchor = rect && (rect.width || rect.height) ? rect : picked.rect;
      setPosition(
        placeNear(
          anchor,
          {
            width: panel?.offsetWidth ?? 0,
            height: panel?.offsetHeight || TOOLBAR_HEIGHT,
          },
          { width: window.innerWidth, height: window.innerHeight },
          // Touch devices draw their own menu above a selection.
          window.matchMedia?.("(pointer: coarse)").matches ?? false,
        ),
      );
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [picked, kind, machine.state]);

  React.useEffect(() => {
    if (!picked) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [picked, close]);

  React.useEffect(() => {
    if (kind) panelRef.current?.querySelector("textarea")?.focus();
  }, [kind]);

  React.useEffect(() => {
    if (machine.state !== "done") return;
    const timer = setTimeout(close, 2000);
    return () => clearTimeout(timer);
  }, [machine.state, close]);

  const open = (next: "edit" | "report") => {
    machine.setStateSafe("selected");
    setKind(next);
  };
  const pending = disabled || machine.state === "submitting";

  return (
    <div
      ref={containerRef}
      data-slot="selection-feedback-root"
      className={className}
    >
      {children}
      {picked ? (
        <div
          ref={panelRef}
          data-slot={kind ? "feedback-widget" : "feedback-toolbar"}
          data-state={machine.state}
          role={kind ? "dialog" : "toolbar"}
          aria-label={
            kind
              ? kind === "edit"
                ? editLabel
                : reportLabel
              : "Feedback on selection"
          }
          className={cn(
            feedbackTheme.className,
            kind
              ? feedbackStyles.selectionPanel
              : feedbackStyles.selectionToolbar,
          )}
          style={{
            ...(feedbackTheme.style as React.CSSProperties),
            ...(style as React.CSSProperties),
            top: position?.top ?? -9999,
            left: position?.left ?? -9999,
          }}
          // Pressing a button must not clear the selection it describes.
          onMouseDown={(event) => {
            if (!kind) event.preventDefault();
          }}
        >
          {kind ? (
            <>
              {machine.state !== "done" ? (
                <>
                  <blockquote className={feedbackStyles.selectionQuote}>
                    {picked.quote}
                  </blockquote>
                  <FeedbackResponse sending={machine.state === "submitting"}>
                    <FeedbackTextField
                      attached
                      label={
                        kind === "edit" ? "Suggested change" : "What's wrong?"
                      }
                      placeholder={
                        kind === "edit"
                          ? "Suggest a better wording"
                          : "What's wrong with this?"
                      }
                      text={text}
                      setText={setText}
                      disabled={pending}
                      describedBy={machine.submitError ? errorId : undefined}
                    />
                  </FeedbackResponse>
                </>
              ) : null}
              <FeedbackFormActions
                state={machine.state}
                submitError={machine.submitError}
                disabled={disabled}
                canSubmit={kind === "report" || !!text.trim()}
                submitLabel="Send"
                errorId={errorId}
                thankYouMessage={thankYouMessage}
                onSkip={close}
                skipLabel="Cancel"
                onSubmit={() => {
                  if (pending) return;
                  void machine.submitPayload({
                    location,
                    widgetType: "selection",
                    kind,
                    quote: picked.quote,
                    ...(text.trim() ? { text: text.trim() } : {}),
                  });
                }}
              />
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => open("edit")}
                className={cn(
                  feedbackStyles.selectionAction,
                  feedbackStyles.focus,
                )}
              >
                <PencilLine className="size-4" aria-hidden="true" />
                {editLabel}
              </Button>
              <span
                aria-hidden="true"
                className={feedbackStyles.selectionDivider}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => open("report")}
                className={cn(
                  feedbackStyles.selectionAction,
                  feedbackStyles.focus,
                )}
              >
                <Flag className="size-4" aria-hidden="true" />
                {reportLabel}
              </Button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
