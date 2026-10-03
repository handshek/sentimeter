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
      "Prerequisites: React, TypeScript, Tailwind CSS and shadcn. Uses your local Button, Textarea, theme tokens and utilities.",
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
      "Pass an asynchronous submit handler to validate and persist feedback. Custom submit takes precedence over apiKey and optional hosted analytics. Configure allowed origins. Errors are retryable; WidgetSubmitError includes code, status and retryAfterMs.",
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
