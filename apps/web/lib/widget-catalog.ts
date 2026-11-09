import registry from "registry/registry.json";
import type {
  WidgetFollowUp,
  WidgetLayout,
  WidgetSize,
} from "@workspace/widgets";
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

// See CONTRIBUTING.md.
export type WidgetSlug =
  "emoji-feedback" | "like-dislike" | "star-rating" | "nps";

export type WidgetInstallMetadata = {
  slug: WidgetSlug;
  name: string;
  tabLabel: string;
  registryName: string;
  targetFiles: string[];
  widgetFiles: string[];
  sharedFolder: string;
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

function commonFolder(paths: string[]) {
  const [first, ...rest] = paths.map((path) => path.split("/").slice(0, -1));
  let depth = first!.length;
  for (const parts of rest) {
    while (parts.slice(0, depth).join("/") !== first!.slice(0, depth).join("/"))
      depth -= 1;
  }
  return `${first!.slice(0, depth).join("/")}/`;
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
    widgetFiles,
    sharedFolder: commonFolder(sharedFiles),
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
  icon: "emoji" | "thumbs" | "star" | "nps";
  preview: "emoji" | "thumbs" | "star" | "nps";
  componentName: "EmojiFeedback" | "LikeDislike" | "StarRating" | "NpsScore";
  defaultVariant: "emoji" | "icons" | null;
  example: WidgetDemoOptions;
  installSnippet: string;
  usageSnippet: string;
  props: WidgetDocRow[];
  installMetadata: WidgetInstallMetadata;
};

export const localExampleNote =
  "Examples run locally. Nothing is sent or stored.";

export type WidgetDemoOptions = {
  layout: WidgetLayout;
  variant: "emoji" | "icons";
  size: WidgetSize;
  followUp: WidgetFollowUp;
};

export function getUsageSnippet(
  widget: Pick<
    WidgetDocConfig,
    "registryName" | "componentName" | "defaultVariant" | "example"
  >,
  options?: Partial<WidgetDemoOptions>,
  submission: "local" | "custom" = "local",
) {
  const { variant, size, layout, followUp } = {
    ...widget.example,
    ...options,
  };
  const props = [
    ...(layout !== "stacked" ? [`layout="${layout}"`] : []),
    ...(widget.defaultVariant !== null && variant !== widget.defaultVariant
      ? [`variant="${variant}"`]
      : []),
    ...(size !== "default" ? [`size="${size}"`] : []),
    ...(followUp !== "negative" ? [`followUp="${followUp}"`] : []),
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

  const sourcePath = getRegistryItem(
    widget.registryName,
  ).files[0]!.target.replace(/\.tsx?$/, "");
  const component = props
    ? `<${widget.componentName}\n      ${props}\n    />`
    : `<${widget.componentName} />`;

  return `"use client";

import { ${widget.componentName} } from "@/${sourcePath}";${customSubmit}

export function FeedbackExample() {
  return (
    ${component}
  );
}`;
}

export function getCompoundSnippet(widget: WidgetDocConfig) {
  const ratingVariant = widget.preview === "star" ? "stars" : widget.preview;
  const styleProp = widget.preview === "emoji" ? "emojiStyle" : "ratingStyle";
  const ratingStyle =
    widget.defaultVariant === null
      ? ""
      : ` ${styleProp}="${widget.defaultVariant}"`;
  const title =
    widget.preview === "nps"
      ? "How likely are you to recommend us?"
      : "How was your experience?";
  const placeholder =
    widget.preview === "nps"
      ? "What would make it better? (optional)"
      : "What went wrong? (optional)";
  return `"use client";

import {
  FeedbackDescription, FeedbackFooter, FeedbackInput, FeedbackRating,
  FeedbackResponse, FeedbackTitle, FeedbackWidget,
} from "@/components/sentimeter/feedback-system";

export function FeedbackExample() {
  return (
    <FeedbackWidget widgetType="${widget.preview}" followUp="negative">
      <div data-slot="feedback-header" className="flex flex-col gap-1">
        <FeedbackTitle>${title}</FeedbackTitle>
        <FeedbackDescription>Your feedback helps us improve.</FeedbackDescription>
      </div>
      <FeedbackResponse>
        <FeedbackRating variant="${ratingVariant}"${ratingStyle} />
        <FeedbackInput placeholder="${placeholder}" />
      </FeedbackResponse>
      <FeedbackFooter submitLabel="Send" />
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
    prop: "followUp",
    type: '"negative" | "always" | "never"',
    defaultValue: '"negative"',
    description:
      '"negative" asks for optional text after a negative pick; "always" asks after every pick; "never" submits every pick immediately.',
  },
  {
    prop: "submitLabel",
    type: "string",
    defaultValue: '"Send"',
    description: "Label used for the submit action.",
  },
  {
    prop: "showCancel",
    type: "boolean",
    defaultValue: "true",
    description:
      "Shows Cancel beside Send during follow-up. Cancel clears the unsent choice and comment.",
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
    description: "Persistent message shown after a successful submission.",
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

function propsForTitle(title: string) {
  return sharedProps.map((row) =>
    row.prop === "title"
      ? {
          ...row,
          defaultValue: JSON.stringify(title),
        }
      : row,
  );
}

const widgetDefinitions: Record<
  WidgetSlug,
  Omit<WidgetDocConfig, "installMetadata" | "installSnippet" | "usageSnippet">
> = {
  "emoji-feedback": {
    slug: "emoji-feedback",
    name: "Emoji Feedback",
    description:
      "Five faces. A sad pick asks what went wrong; a happy pick says thanks at once.",
    registryName: "emoji-feedback",
    tabLabel: "Emoji",
    icon: "emoji",
    preview: "emoji",
    componentName: "EmojiFeedback",
    defaultVariant: "emoji",
    example: {
      layout: "stacked",
      variant: "emoji",
      size: "default",
      followUp: "negative",
    },
    props: [
      ...propsForTitle("Rate your experience"),
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
  "like-dislike": {
    slug: "like-dislike",
    name: "Like / Dislike",
    description:
      "Thumbs down asks what went wrong. Thumbs up sends feedback and says thanks at once.",
    registryName: "like-dislike",
    tabLabel: "Thumbs",
    icon: "thumbs",
    preview: "thumbs",
    componentName: "LikeDislike",
    defaultVariant: "icons",
    example: {
      layout: "inline",
      variant: "icons",
      size: "default",
      followUp: "negative",
    },
    props: [
      ...propsForTitle("Was this helpful?"),
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
  "star-rating": {
    slug: "star-rating",
    name: "Star Rating",
    description:
      "Five stars. One or two asks what went wrong; three to five sends feedback at once.",
    registryName: "star-rating",
    tabLabel: "Stars",
    icon: "star",
    preview: "star",
    componentName: "StarRating",
    defaultVariant: "icons",
    example: {
      layout: "stacked",
      variant: "icons",
      size: "default",
      followUp: "negative",
    },
    props: [
      ...propsForTitle("Rate your experience"),
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
  nps: {
    slug: "nps",
    name: "NPS",
    description:
      "An eleven-point recommendation scale. Scores 0–6 ask what would make it better; 7–10 say thanks at once.",
    registryName: "nps",
    tabLabel: "NPS",
    icon: "nps",
    preview: "nps",
    componentName: "NpsScore",
    defaultVariant: null,
    example: {
      layout: "stacked",
      variant: "icons",
      size: "default",
      followUp: "negative",
    },
    props: propsForTitle("How likely are you to recommend us?"),
  },
};

export const widgetDocs: WidgetDocConfig[] = Object.values(
  widgetDefinitions,
).map((widget) => ({
  ...widget,
  installSnippet: getInstallCommands(widget.registryName).bun,
  usageSnippet: getUsageSnippet(widget),
  installMetadata: getInstallMetadata(widget),
}));

export function getWidgetDoc(slug: string) {
  return widgetDocs.find((widget) => widget.slug === slug);
}
