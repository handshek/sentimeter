import type { Root } from "fumadocs-core/page-tree";
import { blockDocs } from "./block-catalog";
import { widgetDocs } from "./widget-catalog";

export const docsTree: Root = {
  name: "Docs",
  children: [
    { type: "separator", name: "Get started" },
    { type: "page", name: "All components", url: "/components" },
    { type: "page", name: "Docs", url: "/components/getting-started" },
    { type: "separator", name: "Components" },
    ...widgetDocs.map((widget) => ({
      type: "page" as const,
      name: widget.name,
      url: `/components/${widget.slug}`,
    })),
    { type: "separator", name: "Blocks" },
    ...blockDocs.map((block) => ({
      type: "page" as const,
      name: block.name,
      url: `/components/blocks/${block.slug}`,
    })),
  ],
};

export const widgetToc = [
  { title: "Preview", url: "#preview", depth: 2 },
  { title: "Installation", url: "#installation", depth: 2 },
  { title: "Usage", url: "#usage", depth: 2 },
  { title: "Props", url: "#props", depth: 2 },
];

/** A component page lists its examples between Preview and Installation. */
export function componentToc(
  examples: readonly { id: string; title: string }[],
) {
  if (!examples.length) return widgetToc;
  const [preview, ...rest] = widgetToc;
  return [
    preview!,
    { title: "Examples", url: "#examples", depth: 2 },
    ...examples.map((example) => ({
      title: example.title,
      url: `#example-${example.id}`,
      depth: 3,
    })),
    ...rest,
  ];
}

export const gettingStartedSections = [
  {
    title: "Start with a shadcn app",
    url: "#prerequisites",
    depth: 2,
    content:
      "Prerequisites: React, TypeScript, Tailwind CSS and shadcn. Uses your local Button, Textarea, Label, theme tokens and utilities.",
  },
  {
    title: "Install a component",
    url: "#install",
    depth: 2,
    content:
      "Install open source with bun, pnpm, npm or Yarn using shadcn add. Local demos send no requests and do not store feedback.",
  },
  {
    title: "Connect your backend",
    url: "#submission",
    depth: 2,
    content:
      "Pass an asynchronous submit handler to validate and persist feedback. Without a handler, submission completes locally. Custom handlers can throw WidgetSubmitError with a user-facing message and retryAfterMs. Failed submissions remain retryable.",
  },
  {
    title: "Keep it accessible",
    url: "#accessibility",
    depth: 2,
    content:
      "Keyboard focus, accessible reaction names, aria-pressed, success and error announcements. Minimum container width 288px. Reaction targets stay 44px tall; NPS asks in words first, then shows at most seven 44px scores. Arrow keys move within a rating scale and choose Survey reasons. FeedbackForm attaches page and device context; Survey collects a reason and optional note.",
  },
  {
    title: "Using an AI agent",
    url: "#agents",
    depth: 2,
    content:
      "llms.txt, Markdown docs, namespaced registry @sentimeter, components.json and shadcn MCP integration.",
  },
];

export const designSystemSections = [
  {
    title: "System overview",
    url: "/design-system",
    content:
      "Sentimeter’s shared visual language for the website, documentation, dashboard, and feedback widgets. Foundations, reusable components, and page composition.",
  },
  {
    title: "Typography",
    url: "/design-system/typography",
    content:
      "Geist Sans and Geist Mono, responsive type scale, display and page headings, section titles, body copy, labels, captions, code, and readable line lengths.",
  },
  {
    title: "Color",
    url: "/design-system/color",
    content:
      "Semantic colors and foreground pairs. Background, card, muted, primary action, accent, border, focus, destructive, and status colors in light and dark themes.",
  },
  {
    title: "Layout and space",
    url: "/design-system/layout",
    content:
      "Spacing scale, responsive containers, content grids, section rhythm, radius, surfaces, and elevation. The parent owns composition; components own internal spacing.",
  },
  {
    title: "Icons and motion",
    url: "/design-system/icons-motion",
    content:
      "Lucide icons, accessible labels, glyph size and stroke, touch targets, transitions, and reduced motion. Emoji faces are the one built-in exception.",
  },
  {
    title: "Components",
    url: "/design-system/components",
    content:
      "Installed shadcn components and interactive states: buttons, form controls, badges, cards, tabs, tables, feedback, focus, disabled, error, and success.",
  },
  {
    title: "Page patterns",
    url: "/design-system/patterns",
    content:
      "Composing foundations and components into landing pages, documentation, dashboards, forms, empty states, and error recovery.",
  },
  {
    title: "Feedback components",
    url: "/design-system/widgets",
    content:
      "The widget inherits the host theme. Stacked and inline layouts, custom glyphs, tokens, Lucide icons, native emoji, and submission states.",
  },
];
