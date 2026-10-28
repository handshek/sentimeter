import type { Root } from "fumadocs-core/page-tree";
import { widgetDocs } from "./widget-catalog";

export const docsTree: Root = {
  name: "Documentation",
  children: [
    { type: "separator", name: "Getting Started" },
    { type: "page", name: "Overview", url: "/components" },
    {
      type: "page",
      name: "Installation & Integration",
      url: "/components/getting-started",
    },
    {
      type: "page",
      name: "Design System",
      url: "/design-system",
    },
    { type: "separator", name: "Feedback Widgets" },
    ...widgetDocs.map((widget) => ({
      type: "page" as const,
      name: widget.name,
      url: `/components/${widget.slug}`,
    })),
  ],
};

export const widgetToc = [
  { title: "Preview", url: "#preview", depth: 2 },
  { title: "Installation", url: "#installation", depth: 2 },
  { title: "Usage", url: "#usage", depth: 2 },
  { title: "Submission Behavior", url: "#submission", depth: 2 },
  { title: "Props", url: "#props", depth: 2 },
];

export const gettingStartedSections = [
  {
    title: "Start With a shadcn App",
    url: "#prerequisites",
    depth: 2,
    content:
      "Prerequisites: React, TypeScript, Tailwind CSS and shadcn. Uses your local Button, Textarea, Label, theme tokens and utilities.",
  },
  {
    title: "Install a Widget",
    url: "#install",
    depth: 2,
    content:
      "Install open source with bun, pnpm, npm or Yarn using shadcn add. Local demos send no requests and do not store feedback.",
  },
  {
    title: "Connect Your Backend",
    url: "#submission",
    depth: 2,
    content:
      "Pass an asynchronous submit handler to validate and persist feedback. Without a handler, submission completes locally. Custom handlers can throw WidgetSubmitError with a user-facing message and retryAfterMs. Failed submissions remain retryable.",
  },
  {
    title: "Keep the Widget Accessible",
    url: "#accessibility",
    depth: 2,
    content:
      "Keyboard focus, accessible reaction names, aria-pressed, success and error announcements. Minimum container width 288px. Touch targets at least 44×44px.",
  },
  {
    title: "Using an Agent?",
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
      "Lucide icons, accessible labels, glyph size and stroke, touch targets, transitions, and reduced motion. Native emoji is an explicit widget option.",
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
    title: "Feedback widgets",
    url: "/design-system/widgets",
    content:
      "The widget inherits the host theme. Stacked and inline layouts, custom glyphs, tokens, Lucide icons, native emoji, and submission states.",
  },
];
