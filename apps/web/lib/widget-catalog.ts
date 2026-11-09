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
  | "emoji-feedback"
  | "like-dislike"
  | "star-rating"
  | "nps"
  | "feedback-form"
  | "survey";

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
  preview: "emoji" | "thumbs" | "star" | "nps" | "form" | "survey";
  componentName:
    | "EmojiFeedback"
    | "LikeDislike"
    | "StarRating"
    | "NpsScore"
    | "FeedbackForm"
    | "Survey";
  example: WidgetDemoOptions;
  /** What Replay types into the follow-up after a negative pick. */
  replayText: string;
  installSnippet: string;
  usageSnippet: string;
  props: WidgetDocRow[];
  installMetadata: WidgetInstallMetadata;
};

export const localExampleNote =
  "Examples run locally. Nothing is sent or stored.";

export type WidgetDemoOptions = {
  layout: WidgetLayout;
  size: WidgetSize;
  followUp: WidgetFollowUp;
};

export function getUsageSnippet(
  widget: Pick<WidgetDocConfig, "registryName" | "componentName" | "example">,
  options?: Partial<WidgetDemoOptions>,
  submission: "local" | "custom" = "local",
) {
  const { size, layout, followUp } = {
    ...widget.example,
    ...options,
  };
  const rating =
    widget.componentName !== "FeedbackForm" &&
    widget.componentName !== "Survey";
  const props = [
    ...(rating && layout !== "stacked" ? [`layout="${layout}"`] : []),
    ...(rating && size !== "default" ? [`size="${size}"`] : []),
    ...(rating && followUp !== "negative" ? [`followUp="${followUp}"`] : []),
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
  if (widget.preview === "form" || widget.preview === "survey")
    return getUsageSnippet(widget);
  const ratingVariant = widget.preview === "star" ? "stars" : widget.preview;
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
        <FeedbackRating variant="${ratingVariant}" />
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
    type: "WidgetSubmit<RatingPayload>",
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
    type: "(payload: RatingPayload) => void",
    defaultValue: "-",
    description: "Fires right before submission begins.",
  },
  {
    prop: "onSubmitSuccess",
    type: "(payload: RatingPayload) => void",
    defaultValue: "-",
    description: "Fires after a successful submission.",
  },
  {
    prop: "onSubmitError",
    type: "(error: unknown, payload: RatingPayload) => void",
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

export const feedbackFormContextDescription =
  "FeedbackForm collects the page URL without its query string or hash (origin and pathname), the pathname as route, browser and OS family inferred from navigator.userAgent, and window.innerWidth/innerHeight in CSS pixels. Unknown browser or OS families use Unknown. The muted line previews the route, browser, OS, and viewport after mount; context is sampled again at each submit attempt. It collects no user-agent string, versions, console errors, screenshots, or categories. Without submit, nothing is sent or stored.";

export const feedbackFormCompletionDescription =
  "Send is disabled for empty or whitespace-only text. A successful submission replaces the field with Got it. Sorry about that. and We read every message. The thank-you stays mounted. onDone fires once about 2 seconds after it appears, so a host can close its popover, dialog, or sheet. Unmounting cancels the pending callback. A failed submission retains the text and offers Try again.";

export const surveyOptionsDescription =
  "Pass options as readonly { label: string, value: string, notePlaceholder?: string } pairs with unique values. Defaults are Too expensive (too-expensive), Something didn't work (not-working), Missing a feature I need (missing-feature), Switching to another tool (switching), and Other (other). Each reason opens an optional note: What would make it worth the price?, What didn't work?, What's missing?, What are you switching to?, or Tell us more, each marked (optional). Set notePlaceholder on a reason to replace its prompt; custom reasons default to Tell us more (optional).";

export const surveyCompletionDescription =
  "Pick one reason, then optionally add a note. Changing the reason clears the previous note. Send stays disabled until a reason is picked. Skip calls onSkip without submitting, resetting, or showing a thank-you; the host decides whether to dismiss its container. Skip appears only when onSkip is passed, works before or after a pick, and is disabled while submitting. Send includes the chosen reason value and any non-empty trimmed note. Success shows Thanks for telling us. persistently; onDone fires once about 2 seconds later. Unmounting cancels the pending callback. Errors retain the selected reason and note for retry. Survey collects no page or device context.";

const formProps = (payload: "FormPayload" | "SurveyPayload") =>
  sharedProps
    .filter((row) =>
      [
        "location",
        "disabled",
        "className",
        "style",
        "submitLabel",
        "onStateChange",
        "onSubmitStart",
        "onSubmitSuccess",
        "onSubmitError",
      ].includes(row.prop),
    )
    .map((row) => ({
      ...row,
      type: row.type.replace("RatingPayload", payload),
    }));

const widgetDefinitions: Record<
  WidgetSlug,
  Omit<WidgetDocConfig, "installMetadata" | "installSnippet" | "usageSnippet">
> = {
  "emoji-feedback": {
    slug: "emoji-feedback",
    name: "Emoji Feedback",
    description:
      "An emoji rating component for React and shadcn/ui. A sad face asks what went wrong; a happy face says thanks.",
    registryName: "emoji-feedback",
    tabLabel: "Emoji",
    icon: "emoji",
    preview: "emoji",
    replayText: "Card got declined twice.",
    componentName: "EmojiFeedback",
    example: {
      layout: "stacked",
      size: "default",
      followUp: "negative",
    },
    props: [
      ...propsForTitle("Rate your experience"),
      {
        prop: "glyphs",
        type: "FaceGlyphs",
        defaultValue: "-",
        description:
          "Five custom glyphs, worst to best (values 1–5), replacing the built-in faces 😖 😕 😐 😊 😍. Pass emoji, icons, images, or { glyph, label } to name each one.",
      },
    ],
  },
  "like-dislike": {
    slug: "like-dislike",
    name: "Like / Dislike",
    description:
      "A thumbs up/down feedback component for React and shadcn/ui. Thumbs down asks what went wrong.",
    registryName: "like-dislike",
    tabLabel: "Thumbs",
    icon: "thumbs",
    preview: "thumbs",
    replayText: "The steps skipped the env vars.",
    componentName: "LikeDislike",
    example: {
      layout: "inline",
      size: "default",
      followUp: "negative",
    },
    props: [
      ...propsForTitle("Was this helpful?"),
      {
        prop: "glyphs",
        type: "ThumbGlyphs",
        defaultValue: "-",
        description:
          "Two custom glyphs, replacing the built-in thumb icons: like (value 1), then dislike (value 0). Pass emoji, icons, images, or { glyph, label } to name each one.",
      },
    ],
  },
  "star-rating": {
    slug: "star-rating",
    name: "Star Rating",
    description:
      "A 1–5 star rating component for React and shadcn/ui. One or two stars ask what went wrong.",
    registryName: "star-rating",
    tabLabel: "Stars",
    icon: "star",
    preview: "star",
    replayText: "Setup took longer than expected.",
    componentName: "StarRating",
    example: {
      layout: "stacked",
      size: "default",
      followUp: "negative",
    },
    props: [
      ...propsForTitle("Rate your experience"),
      {
        prop: "glyph",
        type: "FeedbackGlyph",
        defaultValue: "-",
        description:
          'One custom glyph repeated five times, replacing the built-in star, such as a heart. Pass { glyph, label: "heart" } so controls read “Rate 3 hearts”.',
      },
    ],
  },
  nps: {
    slug: "nps",
    name: "NPS",
    description:
      "An NPS survey component (0–10) for React and shadcn/ui. Scores of 0–6 ask what would make it better.",
    registryName: "nps",
    tabLabel: "NPS",
    icon: "nps",
    preview: "nps",
    replayText: "Faster exports would help.",
    componentName: "NpsScore",
    example: {
      layout: "stacked",
      size: "default",
      followUp: "negative",
    },
    props: propsForTitle("How likely are you to recommend us?"),
  },
  "feedback-form": {
    slug: "feedback-form",
    name: "Feedback Form",
    description:
      "A feedback form for React and shadcn/ui. One text box, with the page, browser and screen size attached.",
    registryName: "feedback-form",
    tabLabel: "Form",
    icon: "emoji",
    preview: "form",
    replayText: "Save button does nothing on billing.",
    componentName: "FeedbackForm",
    example: {
      layout: "stacked",
      size: "default",
      followUp: "negative",
    },
    props: [
      ...formProps("FormPayload"),
      {
        prop: "title",
        type: "string",
        defaultValue: '"What happened?"',
        description: "Heading above the text field.",
      },
      {
        prop: "placeholder",
        type: "string",
        defaultValue: '"Tell us what went wrong or what you expected…"',
        description: "Hint inside the named text field.",
      },
      {
        prop: "thankYouMessage",
        type: "ReactNode",
        defaultValue: '"Got it. Sorry about that."',
        description:
          "Persistent confirmation, followed by We read every message.",
      },
      {
        prop: "submit",
        type: "WidgetSubmit<FormPayload>",
        defaultValue: "-",
        description:
          "Async handler receiving widgetType: form, location, trimmed text, and context. Without it, completion is local.",
      },
      {
        prop: "onDone",
        type: "() => void",
        defaultValue: "-",
        description:
          "Fires once about 2 seconds after confirmation appears. Hosts can close their container; unmounting cancels the callback.",
      },
    ],
  },
  survey: {
    slug: "survey",
    name: "Survey",
    description:
      "A one-question survey for React and shadcn/ui. Users pick a reason, then add an optional note.",
    registryName: "survey",
    tabLabel: "Survey",
    icon: "emoji",
    preview: "survey",
    replayText: "CSV export kept timing out.",
    componentName: "Survey",
    example: {
      layout: "stacked",
      size: "default",
      followUp: "negative",
    },
    props: [
      ...formProps("SurveyPayload"),
      {
        prop: "title",
        type: "string",
        defaultValue: '"Why are you leaving?"',
        description: "Question naming the reason group.",
      },
      {
        prop: "description",
        type: "string",
        defaultValue: '"One click helps us improve."',
        description: "Supporting text below the question.",
      },
      {
        prop: "options",
        type: "readonly SurveyOption[]",
        defaultValue: "Five cancellation reasons",
        description: surveyOptionsDescription,
      },
      {
        prop: "thankYouMessage",
        type: "ReactNode",
        defaultValue: '"Thanks for telling us."',
        description: "Persistent confirmation after Send succeeds.",
      },
      {
        prop: "submit",
        type: "WidgetSubmit<SurveyPayload>",
        defaultValue: "-",
        description:
          "Async handler receiving widgetType: survey, location, the chosen string value, and optional trimmed text. Without it, completion is local.",
      },
      {
        prop: "onSkip",
        type: "() => void",
        defaultValue: "-",
        description:
          "Called by Skip before or after a pick. Does not submit, reset, or show confirmation. The host owns dismissal.",
      },
      {
        prop: "onDone",
        type: "() => void",
        defaultValue: "-",
        description:
          "Fires once about 2 seconds after confirmation appears. Unmounting cancels the callback.",
      },
    ],
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
