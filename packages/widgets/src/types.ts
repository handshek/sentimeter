export type WidgetState = "idle" | "selected" | "submitting" | "done";

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

