import type { WidgetSubmit } from "@repo/widgets";

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
    defaultValue: '"https://coordinated-perch-697.convex.site/feedback"',
    description: "Override the default feedback submission endpoint.",
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
    usageSnippet: `import { EmojiFeedback } from "@/components/sentimeter/emoji-feedback";

<EmojiFeedback
  apiKey="pk_your-api-key"
  location="/pricing"
/>`,
    props: [
      ...sharedProps,
      {
        prop: "variant",
        type: '"emoji" | "tabler"',
        defaultValue: '"emoji"',
        description: "Switches between native emoji and Tabler face icons.",
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
    usageSnippet: `import { LikeDislike } from "@/components/sentimeter/like-dislike";

<LikeDislike
  apiKey="pk_your-api-key"
  location="/docs/getting-started"
/>`,
    props: sharedProps,
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
    usageSnippet: `import { StarRating } from "@/components/sentimeter/star-rating";

<StarRating
  apiKey="pk_your-api-key"
  location="/checkout"
/>`,
    props: sharedProps,
  },
];

export function getWidgetDoc(slug: string) {
  return widgetDocs.find((widget) => widget.slug === slug);
}
