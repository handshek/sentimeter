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

The submit payload contains apiKey, location, widgetType, value, and optional text. Without a hosted key, apiKey is an empty string. Emoji and stars use 1–5; thumbs use 0 or 1. Resolve only after persistence succeeds; throw on failure to keep the widget retryable. onSubmitError receives the original error.

## Submission Precedence

1. Custom submit handler, when supplied.
2. Hosted submission, when a non-empty apiKey is supplied without submit.
3. Local-only completion, when neither is supplied.

endpoint overrides hosted intake only; it does not replace a custom submit handler.
Hosted failures are WidgetSubmitError instances with code, optional HTTP status, and optional retryAfterMs. Codes: missing_api_key, invalid_key, origin_not_allowed, rate_limited, invalid_value, invalid_body, network_error, unknown.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
${widget.props.map((row) => `| ${[row.prop, row.type, row.defaultValue, row.description].map(cell).join(" | ")} |`).join("\n")}

## Compound Composition

${code("tsx", getCompoundSnippet(widget))}

## Optional Hosted Analytics

${code("tsx", getUsageSnippet(widget, undefined, "hosted"))}

Create a project at ${SITE_URL}/dashboard, use its publishable key, and configure allowed origins for production. Hosted analytics is optional; custom submit takes precedence.

## Accessibility and Layout

Provide at least 288px of container width. Reaction controls stay on one row and retain at least 44×44px targets. Scaling follows the container, not the viewport.
Preserve accessible names, aria-pressed, visible keyboard focus, disabled states, and success/error announcements when customizing installed source.
`;
}

export function getAgentIndex() {
  return `# Sentimeter

> An open-source, shadcn-first registry of accessible React feedback widgets. Install source into your app and connect your own backend. Hosted analytics is optional.

Requires React, TypeScript, Tailwind CSS, and a configured shadcn app. Public demos run locally without sending or storing feedback. A custom submit handler takes precedence over apiKey-based hosted submission; neither configured means local-only completion.

## Getting Started

- [Getting Started](${SITE_URL}/components/getting-started): Prerequisites, installation, custom persistence, errors, and accessibility.
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
