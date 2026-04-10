"use client";

import * as React from "react";
import {
  Angry,
  Frown,
  Laugh,
  Meh,
  Smile,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

export type WidgetSize = "sm" | "default" | "md" | "lg";

export type FeedbackContextValue = {
  state: WidgetState;
  selectedValue: number | null;
  hidden: boolean;
  disabled: boolean;
  size: WidgetSize;
  select: (value: number) => void;
  submitSelected: (text?: string) => Promise<void>;
  cancel: () => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
};

// ─── Edit your defaults here ────────────────────────────────
const SENTIMETER_CONFIG = {
  apiKey: "",
  location: "/",
  endpoint: "https://coordinated-perch-697.convex.site/feedback",
} as const;
// ────────────────────────────────────────────────────────────

type UseWidgetMachineArgs = {
  payloadBase: Omit<WidgetPayload, "value">;
  disabled?: boolean;
  doneDurationMs: number;
  submit: WidgetSubmit;
  onStateChange?: (state: WidgetState) => void;
  onSelect?: (value: number) => void;
  onSubmitStart?: (payload: WidgetPayload) => void;
  onSubmitSuccess?: (payload: WidgetPayload) => void;
  onSubmitError?: (error: unknown, payload: WidgetPayload) => void;
};

const Ctx = React.createContext<FeedbackContextValue | null>(null);

const DEFAULT_EMOJIS = ["😖", "😕", "😐", "😊", "😍"] as const;

const THUMB_EMOJIS = ["👎", "👍"] as const;

const LUCIDE_FACE_SET = [
  { Icon: Angry, label: "Angry" },
  { Icon: Frown, label: "Sad" },
  { Icon: Meh, label: "Neutral" },
  { Icon: Smile, label: "Happy" },
  { Icon: Laugh, label: "Delighted" },
] as const;

const CONTAINER_SIZE_MAP: Record<WidgetSize, string> = {
  sm: "max-w-[360px] p-5",
  default: "max-w-[400px] p-6",
  md: "max-w-[440px] p-7",
  lg: "max-w-[480px] p-8",
};

const RATING_SIZE_MAP: Record<
  WidgetSize,
  { iconSize: number; btnClass: string; emojiClass: string }
> = {
  sm: { iconSize: 18, btnClass: "h-8 w-8", emojiClass: "h-8 w-8 text-lg" },
  default: {
    iconSize: 24,
    btnClass: "h-10 w-10",
    emojiClass: "h-10 w-10 text-2xl",
  },
  md: { iconSize: 28, btnClass: "h-12 w-12", emojiClass: "h-12 w-12 text-3xl" },
  lg: { iconSize: 32, btnClass: "h-14 w-14", emojiClass: "h-14 w-14 text-4xl" },
};

const TEXTAREA_SIZE_MAP: Record<WidgetSize, string> = {
  sm: "min-h-[110px] px-3 py-2.5",
  default: "min-h-[120px] px-4 py-3",
  md: "min-h-[132px] px-4 py-3.5",
  lg: "min-h-[144px] px-5 py-4",
};

const FOOTER_BUTTON_SIZE_MAP: Record<WidgetSize, string> = {
  sm: "py-4",
  default: "py-5",
  md: "py-5",
  lg: "py-6",
};

export async function submitFeedback(
  payload: WidgetPayload,
  endpoint = SENTIMETER_CONFIG.endpoint,
) {
  if (!payload.apiKey) return;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) return;

  let error = "failed";
  try {
    const body = await res.json();
    if (typeof body?.error === "string") error = body.error;
  } catch {
    // ignore
  }

  throw new Error(error);
}

function useWidgetMachine({
  payloadBase,
  disabled,
  doneDurationMs,
  submit,
  onStateChange,
  onSelect,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
}: UseWidgetMachineArgs) {
  const [state, setState] = React.useState<WidgetState>("idle");
  const [selectedValue, setSelectedValue] = React.useState<number | null>(null);
  const [hidden, setHidden] = React.useState(false);

  const setStateSafe = React.useCallback(
    (next: WidgetState) => {
      setState(next);
      onStateChange?.(next);
    },
    [onStateChange],
  );

  React.useEffect(() => {
    if (state !== "done") return;

    const timeout = window.setTimeout(() => setHidden(true), doneDurationMs);
    return () => window.clearTimeout(timeout);
  }, [doneDurationMs, state]);

  const select = React.useCallback(
    (value: number) => {
      if (disabled) return;
      if (state === "submitting" || state === "done") return;

      setSelectedValue(value);
      onSelect?.(value);
      setStateSafe("selected");
    },
    [disabled, onSelect, setStateSafe, state],
  );

  const submitSelected = React.useCallback(
    async (text?: string) => {
      if (disabled) return;
      if (state !== "selected") return;
      if (selectedValue == null) return;

      const payload: WidgetPayload = {
        ...payloadBase,
        value: selectedValue,
        ...(text ? { text } : {}),
      };

      setStateSafe("submitting");
      onSubmitStart?.(payload);

      try {
        await submit(payload);
        onSubmitSuccess?.(payload);
        setStateSafe("done");
      } catch (error) {
        onSubmitError?.(error, payload);
        setStateSafe("selected");
      }
    },
    [
      disabled,
      onSubmitError,
      onSubmitStart,
      onSubmitSuccess,
      payloadBase,
      selectedValue,
      setStateSafe,
      state,
      submit,
    ],
  );

  const hide = React.useCallback(() => setHidden(true), []);

  return {
    hidden,
    state,
    selectedValue,
    select,
    submitSelected,
    hide,
  } as const;
}

export function useFeedbackContext(): FeedbackContextValue {
  const ctx = React.useContext(Ctx);

  if (!ctx) {
    throw new Error(
      "Feedback compound components must be used inside <FeedbackWidget>.",
    );
  }

  return ctx;
}

export type FeedbackProviderProps = {
  apiKey?: string;
  location?: string;
  endpoint?: string;
  widgetType: WidgetType;
  disabled?: boolean;
  size?: WidgetSize;
  doneDurationMs?: number;
  submit?: WidgetSubmit;
  children: React.ReactNode;
} & WidgetCallbacks;

function FeedbackProvider({
  apiKey = SENTIMETER_CONFIG.apiKey,
  location = SENTIMETER_CONFIG.location,
  endpoint = SENTIMETER_CONFIG.endpoint,
  widgetType,
  disabled = false,
  size = "default",
  doneDurationMs = 2000,
  submit,
  children,
  onSelect,
  onStateChange,
  onSubmitStart,
  onSubmitSuccess,
  onSubmitError,
  onCancel,
}: FeedbackProviderProps) {
  const payloadBase = React.useMemo<Omit<WidgetPayload, "value">>(
    () => ({ apiKey, location, widgetType }),
    [apiKey, location, widgetType],
  );

  const defaultSubmit = React.useCallback<WidgetSubmit>(
    (payload) => submitFeedback(payload, endpoint),
    [endpoint],
  );

  const machine = useWidgetMachine({
    payloadBase,
    disabled,
    doneDurationMs,
    submit: submit ?? defaultSubmit,
    onSelect,
    onStateChange,
    onSubmitStart,
    onSubmitSuccess,
    onSubmitError,
  });

  const [text, setText] = React.useState("");

  const cancel = React.useCallback(() => {
    machine.hide();
    onCancel?.();
  }, [machine, onCancel]);

  const value = React.useMemo<FeedbackContextValue>(
    () => ({
      state: machine.state,
      selectedValue: machine.selectedValue,
      hidden: machine.hidden,
      disabled: !!disabled,
      size,
      select: machine.select,
      submitSelected: machine.submitSelected,
      cancel,
      text,
      setText,
    }),
    [machine, disabled, size, cancel, text],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export type FeedbackWidgetProps = {
  apiKey?: string;
  location?: string;
  endpoint?: string;
  widgetType: WidgetType;
  disabled?: boolean;
  size?: WidgetSize;
  closeButton?: boolean;
  className?: string;
  doneDurationMs?: number;
  submit?: WidgetSubmit;
  children: React.ReactNode;
} & WidgetCallbacks;

function FeedbackWidgetInner({
  closeButton,
  className,
  children,
}: {
  closeButton?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { hidden, disabled, size, cancel } = useFeedbackContext();

  if (hidden) return null;

  return (
    <div
      className={cn(
        "relative w-full rounded-3xl border border-border/60 bg-background shadow-xl",
        CONTAINER_SIZE_MAP[size],
        className,
      )}
      aria-disabled={disabled ? "true" : "false"}
    >
      {closeButton ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={cancel}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss feedback widget"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      ) : null}
      {children}
    </div>
  );
}

export function FeedbackWidget({
  apiKey,
  location,
  endpoint,
  widgetType,
  disabled,
  size,
  closeButton,
  className,
  doneDurationMs,
  submit,
  children,
  ...callbacks
}: FeedbackWidgetProps) {
  return (
    <FeedbackProvider
      apiKey={apiKey}
      location={location}
      endpoint={endpoint}
      widgetType={widgetType}
      disabled={disabled}
      size={size}
      doneDurationMs={doneDurationMs}
      submit={submit}
      {...callbacks}
    >
      <FeedbackWidgetInner closeButton={closeButton} className={className}>
        {children}
      </FeedbackWidgetInner>
    </FeedbackProvider>
  );
}

export type FeedbackRatingProps = {
  variant: "emoji" | "stars" | "thumbs";
  /** Only for variant "emoji" (5-point mood) */
  emojiStyle?: "emoji" | "icons";
  /** For variant "thumbs" | "stars": Lucide vs Unicode */
  ratingStyle?: "icons" | "emoji";
  className?: string;
};

export function FeedbackRating({
  variant,
  emojiStyle = "emoji",
  ratingStyle = "icons",
  className,
}: FeedbackRatingProps) {
  const { state, selectedValue, disabled, select, size } = useFeedbackContext();
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const isLocked = disabled || state === "submitting";
  const { iconSize, btnClass, emojiClass } = RATING_SIZE_MAP[size];
  const wrapperClass =
    "mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3";

  if (variant === "thumbs") {
    if (ratingStyle === "emoji") {
      const options = [
        { value: 0, label: "Dislike", emoji: THUMB_EMOJIS[0] },
        { value: 1, label: "Like", emoji: THUMB_EMOJIS[1] },
      ] as const;

      return (
        <div className={cn(wrapperClass, className)}>
          {options.map(({ value, label, emoji }) => {
            const selected = selectedValue === value;
            return (
              <button
                key={value}
                type="button"
                disabled={isLocked}
                onClick={() => select(value)}
                className={cn(
                  "relative flex aspect-square shrink-0 items-center justify-center rounded-full transition-all duration-200",
                  emojiClass,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  selected
                    ? "bg-primary/10 ring-2 ring-primary/20"
                    : "hover:bg-muted/50",
                  isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
                aria-pressed={selected ? "true" : "false"}
                aria-label={label}
                title={label}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            );
          })}
        </div>
      );
    }

    const options = [
      { value: 1, label: "Like", Icon: ThumbsUp },
      { value: 0, label: "Dislike", Icon: ThumbsDown },
    ] as const;

    return (
      <div className={cn(wrapperClass, className)}>
        {options.map(({ value, label, Icon }) => {
          const selected = selectedValue === value;

          return (
            <button
              key={label}
              type="button"
              disabled={isLocked}
              onClick={() => select(value)}
              className={cn(
                "relative flex aspect-square shrink-0 items-center justify-center rounded-full transition-all duration-200",
                btnClass,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                selected
                  ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
              aria-pressed={selected ? "true" : "false"}
              aria-label={label}
              title={label}
            >
              <Icon
                size={iconSize}
                strokeWidth={selected ? 2.5 : 2}
                className={cn(selected ? "text-primary" : undefined)}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "stars") {
    const previewValue = hoverValue ?? selectedValue ?? 0;

    if (ratingStyle === "emoji") {
      return (
        <div className={cn(wrapperClass, className)}>
          {Array.from({ length: 5 }).map((_, idx) => {
            const value = idx + 1;
            const filled = value <= previewValue;
            const selected = selectedValue === value;
            const label = `Rate ${value} star${value === 1 ? "" : "s"}`;
            return (
              <button
                key={value}
                type="button"
                disabled={isLocked}
                onMouseEnter={() => setHoverValue(value)}
                onMouseLeave={() => setHoverValue(null)}
                onFocus={() => setHoverValue(value)}
                onBlur={() => setHoverValue(null)}
                onClick={() => select(value)}
                className={cn(
                  "relative flex aspect-square shrink-0 items-center justify-center rounded-full transition-all duration-200",
                  emojiClass,
                  "font-normal leading-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  selected
                    ? "bg-primary/10 ring-2 ring-primary/20"
                    : "hover:bg-muted/50",
                  isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
                aria-pressed={selected ? "true" : "false"}
                aria-label={label}
                title={label}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "select-none",
                    filled
                      ? "text-primary"
                      : "text-muted-foreground/65",
                  )}
                >
                  ⭐
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className={cn(wrapperClass, className)}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const value = idx + 1;
          const filled = value <= previewValue;
          const selected = selectedValue === value;
          const label = `Rate ${value} star${value === 1 ? "" : "s"}`;

          return (
            <button
              key={value}
              type="button"
              disabled={isLocked}
              onMouseEnter={() => setHoverValue(value)}
              onMouseLeave={() => setHoverValue(null)}
              onFocus={() => setHoverValue(value)}
              onBlur={() => setHoverValue(null)}
              onClick={() => select(value)}
              className={cn(
                "relative flex aspect-square shrink-0 items-center justify-center rounded-full transition-all duration-200",
                btnClass,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                selected
                  ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                  : filled
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
              aria-pressed={selected ? "true" : "false"}
              aria-label={label}
              title={label}
            >
              <Star
                size={iconSize}
                fill={filled ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn(wrapperClass, className)}>
      {emojiStyle === "emoji"
        ? DEFAULT_EMOJIS.map((emoji, idx) => {
            const value = idx + 1;
            const selected = selectedValue === value;
            const label = `Rating ${value} of 5`;

            return (
              <button
                key={emoji}
                type="button"
                disabled={isLocked}
                onClick={() => select(value)}
                className={cn(
                  "relative flex aspect-square shrink-0 items-center justify-center rounded-full transition-all duration-200",
                  emojiClass,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  selected
                    ? "bg-primary/10 ring-2 ring-primary/20"
                    : "hover:bg-muted/50",
                  isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
                aria-pressed={selected ? "true" : "false"}
                aria-label={label}
                title={label}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            );
          })
        : LUCIDE_FACE_SET.map(({ Icon, label }, idx) => {
            const value = idx + 1;
            const selected = selectedValue === value;
            const aria = `${label} (${value} of 5)`;

            return (
              <button
                key={label}
                type="button"
                disabled={isLocked}
                onClick={() => select(value)}
                className={cn(
                  "relative flex aspect-square shrink-0 items-center justify-center rounded-full transition-all duration-200",
                  btnClass,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  selected
                    ? "bg-primary/10 text-primary ring-2 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
                aria-pressed={selected ? "true" : "false"}
                aria-label={aria}
                title={aria}
              >
                <Icon
                  size={iconSize}
                  strokeWidth={selected ? 2.5 : 2}
                  className={cn(selected ? "text-primary" : undefined)}
                  aria-hidden="true"
                />
              </button>
            );
          })}
    </div>
  );
}

export type FeedbackInputProps = {
  placeholder?: string;
  className?: string;
};

export function FeedbackInput({
  placeholder = "Share your thoughts",
  className,
}: FeedbackInputProps) {
  const { state, disabled, text, setText, size, selectedValue } =
    useFeedbackContext();

  if (selectedValue === null) return null;

  return (
    <div className={cn("mt-4", className)}>
      <Textarea
        className={cn(
          "w-full resize-none rounded-2xl border border-border/60 bg-muted/15 leading-relaxed",
          TEXTAREA_SIZE_MAP[size],
        )}
        rows={4}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || state === "submitting"}
      />
    </div>
  );
}

export type FeedbackFooterProps = {
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  thankYouMessage?: React.ReactNode;
  className?: string;
};

export function FeedbackFooter({
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancel = false,
  thankYouMessage = "Thanks!",
  className,
}: FeedbackFooterProps) {
  const { state, disabled, submitSelected, cancel, text, size } =
    useFeedbackContext();

  if (state === "done") {
    return (
      <div
        className={cn(
          "mt-3 rounded-2xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground",
          className,
        )}
      >
        {thankYouMessage}
      </div>
    );
  }

  if (state !== "selected" && state !== "submitting") return null;

  return (
    <div className={cn("mt-5 flex gap-3", className)}>
      {showCancel ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || state === "submitting"}
          onClick={cancel}
          className={cn(
            "flex-1 rounded-2xl text-sm font-semibold",
            FOOTER_BUTTON_SIZE_MAP[size],
          )}
        >
          {cancelLabel}
        </Button>
      ) : null}
      <Button
        type="button"
        disabled={disabled || state === "submitting"}
        onClick={() => void submitSelected(text)}
        className={cn(
          "flex-1 rounded-2xl text-sm font-semibold shadow-sm",
          FOOTER_BUTTON_SIZE_MAP[size],
        )}
      >
        {state === "submitting" ? "Submitting..." : submitLabel}
      </Button>
    </div>
  );
}

export type FeedbackTitleProps = {
  className?: string;
  children: React.ReactNode;
};

export function FeedbackTitle({ className, children }: FeedbackTitleProps) {
  return (
    <h3 className={cn("text-base font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

export type FeedbackDescriptionProps = {
  className?: string;
  children: React.ReactNode;
};

export function FeedbackDescription({
  className,
  children,
}: FeedbackDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}
