import type { ReactNode } from "react";

export type WidgetState = "idle" | "selected" | "submitting" | "done";

/** `stacked` is the card; `inline` is a one-line bar that opens after a choice. */
export type WidgetLayout = "stacked" | "inline";

export type WidgetSubmitErrorCode =
  | "rate_limited"
  | "network_error"
  | "unknown";

export class WidgetSubmitError extends Error {
  readonly code: WidgetSubmitErrorCode;
  readonly status?: number;
  readonly retryAfterMs?: number;

  constructor(
    code: WidgetSubmitErrorCode,
    message: string,
    options: { status?: number; retryAfterMs?: number; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "WidgetSubmitError";
    this.code = code;
    this.status = options.status;
    this.retryAfterMs = options.retryAfterMs;
  }
}

export type WidgetType = "emoji" | "thumbs" | "star";

export type WidgetPayload = {
  location: string;
  widgetType: WidgetType;
  value: number;
  text?: string;
};

export type WidgetSubmit = (payload: WidgetPayload) => Promise<void>;

export type WidgetCallbacks = {
  onSelect?: (value: number) => void;
  onStateChange?: (state: WidgetState) => void;
  onSubmitStart?: (payload: WidgetPayload) => void;
  onSubmitSuccess?: (payload: WidgetPayload) => void;
  onSubmitError?: (error: unknown, payload: WidgetPayload) => void;
  /** The close button dismissed the whole widget. */
  onCancel?: () => void;
  /** Cancel cleared the choice and returned the widget to idle. */
  onReset?: () => void;
};

/**
 * One rating choice: an emoji string, an icon element, an image, or any node.
 * Use the object form to give the choice an accessible name.
 */
export type FeedbackGlyph = ReactNode | { glyph: ReactNode; label?: string };

/** Five faces from worst (value 1) to best (value 5). */
export type FaceGlyphs = readonly [
  worst: FeedbackGlyph,
  poor: FeedbackGlyph,
  neutral: FeedbackGlyph,
  good: FeedbackGlyph,
  best: FeedbackGlyph,
];

/** Thumbs in display order: like (value 1), then dislike (value 0). */
export type ThumbGlyphs = readonly [
  like: FeedbackGlyph,
  dislike: FeedbackGlyph,
];
