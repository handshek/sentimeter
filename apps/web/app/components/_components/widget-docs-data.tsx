export type WidgetDocRow = {
  prop: string;
  type: string;
  defaultValue: string;
  description: string;
};

export type WidgetDocConfig = {
  slug: "emoji-feedback" | "like-dislike" | "star-rating";
  name: string;
  description: string;
  registryName: string;
  icon: "emoji" | "thumbs" | "star";
  preview: "emoji" | "thumbs" | "star";
  installSnippet: string;
  usageSnippet: string;
  props: WidgetDocRow[];
};

export type OverviewSection = {
  id:
    | "introduction"
    | "how-it-works"
    | "quick-install"
    | "choose-a-widget"
    | "open-code";
  title: string;
  eyebrow?: string;
  description?: string;
};

const sharedProps: WidgetDocRow[] = [
  {
    prop: "apiKey",
    type: "string",
    defaultValue: '""',
    description: "Publishable Sentimeter project key.",
  },
  {
    prop: "location",
    type: "string",
    defaultValue: '"/"',
    description: "Stable route or identifier for the feedback source.",
  },
  {
    prop: "endpoint",
    type: "string",
    defaultValue: "Sentimeter production URL",
    description:
      "Optional. Defaults to Sentimeter’s hosted ingest URL; override for staging or self-host.",
  },
  {
    prop: "disabled",
    type: "boolean",
    defaultValue: "false",
    description: "Disables selection and submission interactions.",
  },
  {
    prop: "className",
    type: "string",
    defaultValue: "-",
    description: "Additional class names applied to the root widget.",
  },
  {
    prop: "title",
    type: "ReactNode",
    defaultValue: '"Rate your experience" / "Was this helpful?"',
    description: "Main heading rendered above the rating control.",
  },
  {
    prop: "description",
    type: "ReactNode",
    defaultValue: "-",
    description: "Optional supporting text below the title.",
  },
  {
    prop: "showInput",
    type: "boolean",
    defaultValue: "false",
    description: "Shows the optional free-text input field.",
  },
  {
    prop: "submitLabel",
    type: "string",
    defaultValue: '"Submit"',
    description: "Label used for the submit action.",
  },
  {
    prop: "thankYouMessage",
    type: "ReactNode",
    defaultValue: '"Thanks!"',
    description: "Message shown after a successful submission.",
  },
  {
    prop: "doneDurationMs",
    type: "number",
    defaultValue: "2000",
    description: "How long the success state stays visible.",
  },
  {
    prop: "size",
    type: '"sm" | "default" | "md" | "lg"',
    defaultValue: '"default"',
    description: "Controls the overall widget scale.",
  },
  {
    prop: "closeButton",
    type: "boolean",
    defaultValue: "false",
    description: "Shows a close button in the widget chrome.",
  },
  {
    prop: "submit",
    type: "WidgetSubmit",
    defaultValue: "-",
    description: "Custom async submit handler for feedback payloads.",
  },
  {
    prop: "onSelect",
    type: "(value: number) => void",
    defaultValue: "-",
    description: "Fires when a rating is selected.",
  },
  {
    prop: "onStateChange",
    type: "(state: WidgetState) => void",
    defaultValue: "-",
    description: "Called when the widget machine changes state.",
  },
  {
    prop: "onSubmitStart",
    type: "(payload: WidgetPayload) => void",
    defaultValue: "-",
    description: "Fires right before submission begins.",
  },
  {
    prop: "onSubmitSuccess",
    type: "(payload: WidgetPayload) => void",
    defaultValue: "-",
    description: "Fires after a successful submission.",
  },
  {
    prop: "onSubmitError",
    type: "(error: unknown, payload: WidgetPayload) => void",
    defaultValue: "-",
    description: "Fires when submission fails.",
  },
  {
    prop: "onCancel",
    type: "() => void",
    defaultValue: "-",
    description: "Fires when a user cancels a dismissible widget.",
  },
];

export const widgetDocs: WidgetDocConfig[] = [
  {
    slug: "emoji-feedback",
    name: "Emoji Feedback",
    description:
      "Emoji-based feedback widget with a 5-point scale. Users tap a face that matches their mood.",
    registryName: "emoji-feedback",
    icon: "emoji",
    preview: "emoji",
    installSnippet: `bunx shadcn@latest add "https://registry.handshek.workers.dev/r/emoji-feedback.json"`,
    usageSnippet: `import {
  FeedbackDescription,
  FeedbackFooter,
  FeedbackRating,
  FeedbackTitle,
  FeedbackWidget,
} from "@/components/sentimeter/feedback-system";

export function EmojiFeedbackWidget() {
  return (
    <FeedbackWidget
      apiKey="pk_your-api-key"
      widgetType="emoji"
    >
      <FeedbackTitle>How was your experience?</FeedbackTitle>
      <FeedbackDescription>
        Your feedback helps us improve this page.
      </FeedbackDescription>
      <FeedbackRating variant="emoji" emojiStyle="emoji" />
      <FeedbackFooter thankYouMessage="Thanks for sharing!" />
    </FeedbackWidget>
  );
}`,
    props: [
      ...sharedProps,
      {
        prop: "variant",
        type: '"emoji" | "icons"',
        defaultValue: '"emoji"',
        description:
          "Native mode uses five emojis (worst to best: 😖 😕 😐 😊 😍) or Lucide face icons.",
      },
    ],
  },
  {
    slug: "like-dislike",
    name: "Like / Dislike",
    description:
      "Thumbs up or thumbs down feedback widget. Simple binary sentiment.",
    registryName: "like-dislike",
    icon: "thumbs",
    preview: "thumbs",
    installSnippet: `bunx shadcn@latest add "https://registry.handshek.workers.dev/r/like-dislike.json"`,
    usageSnippet: `import {
  FeedbackDescription,
  FeedbackFooter,
  FeedbackRating,
  FeedbackTitle,
  FeedbackWidget,
} from "@/components/sentimeter/feedback-system";

export function LikeDislikeWidget() {
  return (
    <FeedbackWidget
      apiKey="pk_your-api-key"
      widgetType="thumbs"
    >
      <FeedbackTitle>Was this doc helpful?</FeedbackTitle>
      <FeedbackDescription>
        A quick signal helps us improve the guide.
      </FeedbackDescription>
      <FeedbackRating variant="thumbs" ratingStyle="icons" />
      <FeedbackFooter thankYouMessage="Thanks for the feedback!" />
    </FeedbackWidget>
  );
}`,
    props: [
      ...sharedProps,
      {
        prop: "variant",
        type: '"icons" | "emoji"',
        defaultValue: '"icons"',
        description:
          "Lucide thumbs up/down, or Unicode 👎 (0) / 👍 (1) for the same payload values.",
      },
    ],
  },
  {
    slug: "star-rating",
    name: "Star Rating",
    description:
      "Five-star rating feedback widget. Hover to preview, click to lock.",
    registryName: "star-rating",
    icon: "star",
    preview: "star",
    installSnippet: `bunx shadcn@latest add "https://registry.handshek.workers.dev/r/star-rating.json"`,
    usageSnippet: `import {
  FeedbackDescription,
  FeedbackFooter,
  FeedbackRating,
  FeedbackTitle,
  FeedbackWidget,
} from "@/components/sentimeter/feedback-system";

export function StarRatingWidget() {
  return (
    <FeedbackWidget
      apiKey="pk_your-api-key"
      widgetType="star"
    >
      <FeedbackTitle>Rate your checkout experience</FeedbackTitle>
      <FeedbackDescription>
        Tell us how smooth your purchase felt.
      </FeedbackDescription>
      <FeedbackRating variant="stars" ratingStyle="icons" />
      <FeedbackFooter thankYouMessage="Thanks for your rating!" />
    </FeedbackWidget>
  );
}`,
    props: [
      ...sharedProps,
      {
        prop: "variant",
        type: '"icons" | "emoji"',
        defaultValue: '"icons"',
        description:
          "Lucide stars with hover preview, or five ⭐ emoji (grayscale until included in the preview) for values 1–5.",
      },
    ],
  },
];

export function getWidgetDoc(slug: string) {
  return widgetDocs.find((widget) => widget.slug === slug);
}

export const overviewSections: OverviewSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    eyebrow: "Start Here",
    description:
      "Understand what Sentimeter components are, why they are open-code, and how they fit into a shadcn-native workflow.",
  },
  {
    id: "how-it-works",
    title: "How It Works",
    eyebrow: "Flow",
    description:
      "See the path from installing a widget to collecting reactions and reading analytics in the dashboard.",
  },
  {
    id: "quick-install",
    title: "Quick Install",
    eyebrow: "Setup",
    description:
      "Use a single registry command to pull the component code directly into your app and start customizing immediately.",
  },
  {
    id: "choose-a-widget",
    title: "Choose A Widget",
    eyebrow: "Selection",
    description:
      "Compare the three core widgets and jump into the one that matches the kind of signal you want to collect.",
  },
  {
    id: "open-code",
    title: "Open Code",
    eyebrow: "Principles",
    description:
      "Sentimeter is designed so the host app owns the final UI, composition, and integration details.",
  },
];
