import registry from "../../../registry/registry.json";
import type { WidgetSize } from "@repo/widgets";

export const SITE_URL = registry.homepage;
export const REPOSITORY_URL = "https://github.com/handshek/sentimeter";
export const REGISTRY_BASE_URL = "https://registry.handshek.workers.dev/r";
export const packageManagers = ["bun", "pnpm", "npm", "yarn"] as const;
export type PackageManager = (typeof packageManagers)[number];

export type WidgetInstallMetadata = {
  slug: "emoji-feedback" | "like-dislike" | "star-rating";
  name: string;
  tabLabel: string;
  registryName: string;
  targetFiles: string[];
  widgetFileCount: number;
  sharedFileCount: number;
  packageDependencies: string[];
  shadcnDependencies: string[];
};

export function getInstallCommands(registryName: string) {
  const url = `${REGISTRY_BASE_URL}/${registryName}.json`;
  return {
    bun: `bunx shadcn@latest add "${url}"`,
    pnpm: `pnpm dlx shadcn@latest add "${url}"`,
    npm: `npx shadcn@latest add "${url}"`,
    yarn: `yarn dlx shadcn@latest add "${url}"`,
  } satisfies Record<PackageManager, string>;
}

function getRegistryItem(name: string) {
  const item = registry.items.find((candidate) => candidate.name === name);
  if (!item) throw new Error(`Missing registry item: ${name}`);
  return item;
}

function getInstallMetadata(
  widget: Pick<WidgetDocConfig, "slug" | "name" | "registryName" | "tabLabel">,
): WidgetInstallMetadata {
  const item = getRegistryItem(widget.registryName);
  const shared = getRegistryItem("feedback-system");
  const widgetFiles = item.files.map((file) => file.target);
  const sharedFiles = shared.files.map((file) => file.target);
  return {
    slug: widget.slug,
    name: widget.name,
    tabLabel: widget.tabLabel,
    registryName: item.name,
    targetFiles: [...new Set([...widgetFiles, ...sharedFiles])],
    widgetFileCount: widgetFiles.length,
    sharedFileCount: sharedFiles.length,
    packageDependencies: [
      ...new Set([
        ...(shared.dependencies ?? []),
        ...(item.dependencies ?? []),
      ]),
    ],
    shadcnDependencies: [
      ...new Set([
        ...shared.registryDependencies,
        ...item.registryDependencies,
      ]),
    ].filter((dependency) => !dependency.startsWith("http")),
  };
}

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
  tabLabel: string;
  icon: "emoji" | "thumbs" | "star";
  preview: "emoji" | "thumbs" | "star";
  componentName: "EmojiFeedback" | "LikeDislike" | "StarRating";
  defaultVariant: "emoji" | "icons";
  installSnippet: string;
  usageSnippet: string;
  props: WidgetDocRow[];
  installMetadata: WidgetInstallMetadata;
};

export type WidgetDemoOptions = {
  variant: "emoji" | "icons";
  size: WidgetSize;
  showInput: boolean;
};

export function getUsageSnippet(
  widget: Pick<WidgetDocConfig, "slug" | "componentName" | "defaultVariant">,
  options?: Partial<WidgetDemoOptions>,
  submission: "local" | "custom" | "hosted" = "local",
) {
  const variant = options?.variant ?? widget.defaultVariant;
  const size = options?.size ?? "default";
  const props = [
    "autoHide={false}",
    ...(variant !== widget.defaultVariant ? [`variant="${variant}"`] : []),
    ...(size !== "default" ? [`size="${size}"`] : []),
    ...(options?.showInput ? ["showInput"] : []),
    ...(submission === "custom" ? ["submit={saveFeedback}"] : []),
    ...(submission === "hosted" ? ['apiKey="pk_your-project-key"'] : []),
  ].join("\n      ");
  const customSubmit =
    submission === "custom"
      ? `\nimport type { WidgetSubmit } from "@/components/sentimeter/feedback-system";

// Implement /api/feedback in your app: validate and persist the payload there.
const saveFeedback: WidgetSubmit = async (payload) => {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Your feedback could not be saved.");
};\n`
      : "";

  return `"use client";

import { ${widget.componentName} } from "@/components/sentimeter/${widget.slug}";${customSubmit}

export function FeedbackExample() {
  return (
    <${widget.componentName}
      ${props}
    />
  );
}`;
}

export function getCompoundSnippet(widget: WidgetDocConfig) {
  const ratingVariant = widget.preview === "star" ? "stars" : widget.preview;
  const styleProp = widget.preview === "emoji" ? "emojiStyle" : "ratingStyle";
  return `"use client";

import {
  FeedbackDescription, FeedbackFooter, FeedbackRating,
  FeedbackTitle, FeedbackWidget,
} from "@/components/sentimeter/feedback-system";

export function FeedbackExample() {
  return (
    <FeedbackWidget widgetType="${widget.preview}" autoHide={false}>
      <FeedbackTitle>How was your experience?</FeedbackTitle>
      <FeedbackDescription>Your feedback helps us improve.</FeedbackDescription>
      <FeedbackRating variant="${ratingVariant}" ${styleProp}="${widget.defaultVariant}" />
      <FeedbackFooter />
    </FeedbackWidget>
  );
}`;
}

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
    description:
      "Publishable Sentimeter project key. When set without a custom submit handler, feedback is sent to hosted analytics.",
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
    description: "How long the success state stays visible before auto-hide.",
  },
  {
    prop: "autoHide",
    type: "boolean",
    defaultValue: "true",
    description:
      "Automatically hides the widget after success. Set false to keep the done state mounted.",
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
    description:
      "Custom async submit handler. Takes precedence over hosted and local-only submission.",
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
    description:
      "Fires with the original thrown error and payload when submission fails.",
  },
  {
    prop: "onCancel",
    type: "() => void",
    defaultValue: "-",
    description: "Fires when a user cancels a dismissible widget.",
  },
];

const widgetDefinitions: Omit<
  WidgetDocConfig,
  "installMetadata" | "installSnippet" | "usageSnippet"
>[] = [
  {
    slug: "emoji-feedback",
    name: "Emoji Feedback",
    description:
      "Emoji-based feedback widget with a 5-point scale. Users tap a face that matches their mood.",
    registryName: "emoji-feedback",
    tabLabel: "Emoji",
    icon: "emoji",
    preview: "emoji",
    componentName: "EmojiFeedback",
    defaultVariant: "emoji",
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
    tabLabel: "Thumbs",
    icon: "thumbs",
    preview: "thumbs",
    componentName: "LikeDislike",
    defaultVariant: "icons",
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
    tabLabel: "Stars",
    icon: "star",
    preview: "star",
    componentName: "StarRating",
    defaultVariant: "icons",
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

export const widgetDocs: WidgetDocConfig[] = widgetDefinitions.map(
  (widget) => ({
    ...widget,
    installSnippet: getInstallCommands(widget.registryName).bun,
    usageSnippet: getUsageSnippet(widget),
    installMetadata: getInstallMetadata(widget),
  }),
);

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
