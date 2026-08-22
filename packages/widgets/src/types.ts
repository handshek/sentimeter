export type WidgetState = "idle" | "selected" | "submitting" | "done";

export type WidgetSubmitErrorCode =
  | "missing_api_key"
  | "invalid_key"
  | "origin_not_allowed"
  | "rate_limited"
  | "invalid_value"
  | "invalid_body"
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
  apiKey: string;
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
  onCancel?: () => void;
};
