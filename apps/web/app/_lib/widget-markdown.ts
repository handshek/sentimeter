import {
  getCompoundSnippet,
  getInstallCommands,
  getUsageSnippet,
  namespaceConfig,
  packageManagers,
  REPOSITORY_URL,
  SITE_URL,
  widgetDocs,
  type WidgetDocConfig,
} from "./widget-catalog";

const code = (language: string, source: string) =>
  `\`\`\`${language}\n${source}\n\`\`\``;
const cell = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");

export function getWidgetMarkdown(widget: WidgetDocConfig) {
  const metadata = widget.installMetadata;
  const commands = getInstallCommands(widget.registryName);
  return `# ${widget.name}

${widget.description}

Documentation: ${SITE_URL}/components/${widget.slug}
Source: ${REPOSITORY_URL} (MIT)

## Prerequisites

React, TypeScript, Tailwind CSS, and a configured shadcn project. See https://ui.shadcn.com/docs/installation.
Installed code uses your local shadcn components and theme tokens. No Sentimeter account or runtime package is required.

## Installation

${packageManagers.map((manager) => `### ${manager}\n\n${code("sh", commands[manager])}`).join("\n\n")}

Installs ${metadata.targetFiles.length} Sentimeter files: ${metadata.widgetFileCount} widget wrapper + ${metadata.sharedFileCount} shared feedback-system files.
shadcn dependencies: ${metadata.shadcnDependencies.join(", ")}.
Package dependencies: ${metadata.packageDependencies.join(", ")}.

Exact target paths:

${metadata.targetFiles.map((path) => `- \`${path}\``).join("\n")}

## Local Example

${code("tsx", getUsageSnippet(widget))}

This completes locally: nothing is sent or stored. Examples use autoHide={false} so success stays readable; the default is true with a 2000ms delay.

## Your Backend

${code("tsx", getUsageSnippet(widget, undefined, "custom"))}

Implement /api/feedback in your own app. Validate untrusted input, enforce your app's authentication and abuse protection, and persist before returning success. That endpoint is not supplied by Sentimeter.

The submit payload contains location, widgetType, value, and optional text. The location prop defaults to "/"; set it to identify the feedback source. Emoji and stars use 1–5; thumbs use 0 or 1. Custom glyphs change only the presentation: faces always take five glyphs, thumbs two (like, then dislike), and stars one repeated glyph, so the values stay the same. Resolve only after persistence succeeds; throw on failure to keep the widget retryable. onSubmitError receives the original error.

## Submission behavior

A supplied custom submit handler saves feedback. Without one, the widget completes locally without sending or storing anything.
Custom handlers can throw WidgetSubmitError with a user-facing message and optional status and retryAfterMs. Other errors show a safe retry message. onSubmitError receives the original error for your own logging.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
${widget.props.map((row) => `| ${[row.prop, row.type, row.defaultValue, row.description].map(cell).join(" | ")} |`).join("\n")}

## Compound Composition

${code("tsx", getCompoundSnippet(widget))}

## Design System

The widget inherits the host app’s shadcn colors, font, and radius. It does not change the surrounding app.

${code("tsx", getUsageSnippet(widget, { layout: "inline", showInput: true }))}

The installed feedback-system/design-system.ts holds the recipe and its --feedback-* tokens. Import FeedbackStyle from @/components/sentimeter/feedback-system and use the style prop for local token overrides. The icon variants use Lucide.

Below a 320px widget content-box width, the stacked card's inset is 16px. At 320px and above, the preset’s inset applies. This is a container breakpoint, not a viewport breakpoint. layout="inline" sizes to its content and wraps the question above the choices when space runs out.

Preserve the shared composition: heading, supporting description, a response well (FeedbackResponse) holding the rating and the optional comment, then Cancel and an explicit Submit. Cancel clears an unsent choice; closeButton dismisses the widget. The comment is named by a visually hidden label and hinted by its placeholder. Selection and keyboard focus are distinct states. A submitted comment remains read-only while confirmation replaces the action row. With autoHide enabled in page flow, reserve space in the host layout if later removal would cause a jump.

Widget token and composition reference: ${SITE_URL}/design-system/widgets.

## Accessibility and Layout

Provide at least 288px of container width. Reaction controls stay on one row and retain at least 44×44px targets. Scaling follows the container, not the viewport.
Preserve accessible names, aria-pressed, visible keyboard focus, disabled states, and success/error announcements when customizing installed source.
`;
}

export function getAgentIndex() {
  return `# Sentimeter

> An open-source, shadcn-first registry of accessible React feedback widgets. Install source into your app and connect your own backend.

Requires React, TypeScript, Tailwind CSS, and a configured shadcn app. Public demos run locally without sending or storing feedback. Pass a custom submit handler to save feedback; without one, submission completes locally.

## Getting Started

- [Getting Started](${SITE_URL}/components/getting-started): Prerequisites, installation, custom persistence, errors, and accessibility.
- [Design System](${SITE_URL}/design-system): Typography, semantic color, spacing, components, page patterns, and widget composition.
- [Widget Catalog](${SITE_URL}/components): Try all three launch widgets.
- [Repository](${REPOSITORY_URL}): Canonical source, MIT license, and contributor guidance.

## Widget Documentation (Markdown)

${widgetDocs.map((widget) => `- [${widget.name}](${SITE_URL}/components/${widget.slug}/markdown): ${widget.description}`).join("\n")}

## shadcn Namespace and Agents

Add this entry under registries in your existing components.json:

${code("json", namespaceConfig)}

Then use bunx shadcn@latest add @sentimeter/emoji-feedback (or @sentimeter/like-dislike or @sentimeter/star-rating).
Full-URL commands in each widget document work without namespace configuration.
Use shadcn's existing MCP integration: https://ui.shadcn.com/docs/mcp. No custom Sentimeter MCP server is needed.
`;
}
