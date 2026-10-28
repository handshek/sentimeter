import registry from "registry/registry.json";
import type { WidgetLayout, WidgetSize } from "@workspace/widgets";
import { REGISTRY_URL } from "registry/site.config";

export {
  SITE_URL,
  REPOSITORY_URL,
  LEGAL_CONTACT_EMAIL,
} from "registry/site.config";
export const REGISTRY_BASE_URL = `${REGISTRY_URL}/r`;
export const namespaceConfig = JSON.stringify(
  {
    registries: { "@sentimeter": `${REGISTRY_BASE_URL}/{name}.json` },
  },
  null,
  2,
);
export const packageManagers = ["bun", "pnpm", "npm", "yarn"] as const;
export type PackageManager = (typeof packageManagers)[number];

// The launch widgets. Adding one also needs packages/widgets/src and the
// registry manifest; see CONTRIBUTING.md.
export type WidgetSlug = "emoji-feedback" | "like-dislike" | "star-rating";

export type WidgetInstallMetadata = {
  slug: WidgetSlug;
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
  slug: WidgetSlug;
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
  layout: WidgetLayout;
  variant: "emoji" | "icons";
  size: WidgetSize;
  showInput: boolean;
};

export function getUsageSnippet(
  widget: Pick<WidgetDocConfig, "slug" | "componentName" | "defaultVariant">,
  options?: Partial<WidgetDemoOptions>,
  submission: "local" | "custom" = "local",
) {
  const variant = options?.variant ?? widget.defaultVariant;
  const size = options?.size ?? "default";
  const layout = options?.layout ?? "stacked";
  const props = [
    "autoHide={false}",
    ...(layout !== "stacked" ? [`layout="${layout}"`] : []),
    ...(variant !== widget.defaultVariant ? [`variant="${variant}"`] : []),
    ...(size !== "default" ? [`size="${size}"`] : []),
    ...(options?.showInput ? ["showInput"] : []),
    ...(submission === "custom" ? ["submit={saveFeedback}"] : []),
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
  FeedbackDescription, FeedbackFooter, FeedbackInput, FeedbackRating,
  FeedbackResponse, FeedbackTitle, FeedbackWidget,
} from "@/components/sentimeter/feedback-system";

export function FeedbackExample() {
  return (
    <FeedbackWidget widgetType="${widget.preview}" autoHide={false}>
      <div data-slot="feedback-header" className="flex flex-col gap-1">
        <FeedbackTitle>How was your experience?</FeedbackTitle>
        <FeedbackDescription>Your feedback helps us improve.</FeedbackDescription>
      </div>
      <FeedbackResponse>
        <FeedbackRating variant="${ratingVariant}" ${styleProp}="${widget.defaultVariant}" />
        <FeedbackInput />
      </FeedbackResponse>
      <FeedbackFooter />
    </FeedbackWidget>
  );
}`;
}

const sharedProps: WidgetDocRow[] = [
  {
    prop: "location",
    type: "string",
    defaultValue: '"/"',
    description: "Stable route or identifier included in the submit payload.",
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
    prop: "style",
    type: "FeedbackStyle",
    defaultValue: "-",
    description:
      "Inline styles and typed --feedback-* token overrides, scoped to this widget. No global theme changes.",
  },
  {
    prop: "layout",
    type: '"stacked" | "inline"',
    defaultValue: '"stacked"',
    description:
      "Stacked is the card. Inline is a one-line bar that opens after a choice and collapses when done; it shows the title but not the description.",
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
    defaultValue: '"Submit" / inline "Send"',
    description: "Label used for the submit action.",
  },
  {
    prop: "showCancel",
    type: "boolean",
    defaultValue: "true",
    description:
      "Shows Cancel beside Submit after a choice. Cancel clears the unsent choice and comment.",
  },
  {
    prop: "cancelLabel",
    type: "string",
    defaultValue: '"Cancel"',
    description: "Label used for the Cancel action.",
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
    description: "Shows a close button that dismisses the whole widget.",
  },
  {
    prop: "submit",
    type: "WidgetSubmit",
    defaultValue: "-",
    description:
      "Custom async handler receiving widgetType, value, optional text, and location. Without a handler, submission completes locally.",
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
    prop: "onReset",
    type: "() => void",
    defaultValue: "-",
    description: "Fires when Cancel clears an unsent choice.",
  },
  {
    prop: "onCancel",
    type: "() => void",
    defaultValue: "-",
    description: "Fires when the close button dismisses the widget.",
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
          "Built-in faces: five native emoji (worst to best: 😖 😕 😐 😊 😍), or Lucide face icons. Faces stay grayscale until hovered or chosen.",
      },
      {
        prop: "glyphs",
        type: "FaceGlyphs",
        defaultValue: "-",
        description:
          "Five custom glyphs, worst to best (values 1–5): emoji, icons, images, or { glyph, label }. Replaces variant.",
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
          "Lucide thumbs up/down, or Unicode 👍 (1) / 👎 (0) for the same payload values. Like is shown first.",
      },
      {
        prop: "glyphs",
        type: "ThumbGlyphs",
        defaultValue: "-",
        description:
          "Two custom glyphs: like (value 1), then dislike (value 0). Emoji, icons, images, or { glyph, label }. Replaces variant.",
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
      {
        prop: "glyph",
        type: "FeedbackGlyph",
        defaultValue: "-",
        description:
          'One custom glyph repeated five times, such as a heart. Pass { glyph, label: "heart" } so controls read “Rate 3 hearts”. Replaces variant.',
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
