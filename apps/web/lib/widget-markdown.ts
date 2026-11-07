import { blockDocs } from "./block-catalog";
import {
  feedbackFormContextDescription,
  feedbackFormCompletionDescription,
  surveyOptionsDescription,
  surveyCompletionDescription,
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
  const rating = widget.preview !== "form" && widget.preview !== "survey";
  return `# ${widget.name}

${widget.description}

Documentation: ${SITE_URL}/components/${widget.slug}
Source: ${REPOSITORY_URL} (MIT)

## Prerequisites

React, TypeScript, Tailwind CSS, and a configured shadcn project. See https://ui.shadcn.com/docs/installation.
Installed code uses your local shadcn components and theme tokens. No Sentimeter account or runtime package is required.

## Installation

${packageManagers.map((manager) => `### ${manager}\n\n${code("sh", commands[manager])}`).join("\n\n")}

Adds ${metadata.widgetFiles.map((path) => `\`${path}\``).join(", ")} and the shared \`${metadata.sharedFolder}\` folder (${metadata.targetFiles.length} files in total).
shadcn dependencies: ${metadata.shadcnDependencies.join(", ")}.
Package dependencies: ${metadata.packageDependencies.join(", ")}.

Exact target paths:

${metadata.targetFiles.map((path) => `- \`${path}\``).join("\n")}

## Local Example

${code("tsx", getUsageSnippet(widget))}

This completes locally: nothing is sent or stored. The thank-you stays on screen until the host removes the component.

## Your Backend

${code("tsx", getUsageSnippet(widget, undefined, "custom"))}

Implement /api/feedback in your own app. Validate untrusted input, enforce your app's authentication and abuse protection, and persist before returning success. That endpoint is not supplied by Sentimeter.

${rating ? "The submit payload contains location, widgetType, value, and optional text." : widget.preview === "survey" ? 'The submit payload is { widgetType: "survey", location: string, value: string, text?: string }. The value is the chosen reason, and text is omitted when the trimmed note is empty. No page or device context is collected.' : 'The submit payload is { widgetType: "form", location: string, text: string, context?: { url: string, route: string, browser: string, os: string, viewport: { width: number, height: number } } }. Text is trimmed; there is no numeric value.'} The location prop defaults to "/"; set it to identify the feedback source.${rating ? " Emoji and stars use 1–5; thumbs use 0 or 1; NPS uses 0–10. Custom glyphs change only the presentation: faces always take five glyphs, thumbs two (like, then dislike), and stars one repeated glyph, so the values stay the same." : ""} Resolve only after persistence succeeds; throw on failure to keep the widget retryable. onSubmitError receives the original error.

## Submission behavior

${rating ? `By default, negative picks open an optional text box with Cancel and Send. Negative means emoji or stars 1–2, thumbs down (0), or NPS 0–6. Other picks submit immediately. Set followUp="always" to ask after every pick, or "never" to submit every pick immediately. The thank-you persists after success.` : widget.preview === "survey" ? `${surveyOptionsDescription}\n\n${surveyCompletionDescription}` : `${feedbackFormCompletionDescription}\n\n${feedbackFormContextDescription}`}

A supplied custom submit handler saves feedback. Without one, the widget completes locally without sending or storing anything.
Custom handlers can throw WidgetSubmitError with a user-facing message and optional status and retryAfterMs. Other errors show a safe retry message. onSubmitError receives the original error for your own logging.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
${widget.props.map((row) => `| ${[row.prop, row.type, row.defaultValue, row.description].map(cell).join(" | ")} |`).join("\n")}

${rating ? `## Compound Composition\n\n${code("tsx", getCompoundSnippet(widget))}` : ""}

## Design System

The widget inherits the host app’s shadcn colors, font, and radius. It does not change the surrounding app.

${code("tsx", getUsageSnippet(widget, { layout: "inline", followUp: "always" }))}

The installed feedback-system/design-system.ts holds the recipe and its --feedback-* tokens. Import FeedbackStyle from @/components/sentimeter/feedback-system and use the style prop for local token overrides. The icon variants use Lucide.

${
  rating
    ? `Below a 320px widget content-box width, the stacked card's inset is 16px. At 320px and above, the preset’s inset applies. This is a container breakpoint, not a viewport breakpoint. layout="inline" sizes to its content and wraps the question above the choices when space runs out.

Preserve the shared composition: heading, supporting description, a response well (FeedbackResponse) holding the rating and the optional comment, then Cancel and Send during follow-up. Cancel clears an unsent choice; closeButton dismisses the widget. The comment is named by a visually hidden label and hinted by its placeholder. Selection and keyboard focus are distinct states. After success, the comment closes and a persistent confirmation replaces the action row.`
    : widget.preview === "survey"
      ? "Survey uses the shared stacked card, response well, optional field, paired Skip/Send actions, and confirmation recipes. The reason group has radio semantics. Selection and focus remain distinct."
      : "FeedbackForm is a stacked card using the same heading, field, actions, and confirmation recipes. Its text field has a persistent accessible name. It has no rating, glyph, layout, or follow-up controls."
}

Widget token and composition reference: ${SITE_URL}/design-system/widgets.

## Accessibility and Layout

Provide at least 288px of container width. ${rating ? `Reaction controls stay on one row and retain 44px tall targets. NPS divides the available width into eleven segments, with the legend "Not likely" / "Very likely". Use arrow keys to move focus within the scale and Enter or Space to choose. Scaling follows the container, not the viewport.` : widget.preview === "survey" ? "Reason rows stay at least 44px tall and wrap long labels. Arrow keys choose and focus the adjacent reason; Home and End reach the first and last options. The optional note appears after a pick. Keep radio checked states and a single tab stop within the group." : "The form wraps long route context within the card and keeps the Send action keyboard accessible with a 44px target."}
Preserve accessible names, ${rating ? "aria-pressed, " : ""}visible keyboard focus, disabled states, and success/error announcements when customizing installed source.
`;
}

export function getAgentIndex() {
  return `# Sentimeter

> An open-source, shadcn-first registry of accessible React feedback widgets. Install source into your app and connect your own backend.

Requires React, TypeScript, Tailwind CSS, and a configured shadcn app. Public demos run locally without sending or storing feedback. Pass a custom submit handler to save feedback; without one, submission completes locally.

## Getting Started

- [Getting Started](${SITE_URL}/components/getting-started): Prerequisites, installation, custom persistence, errors, and accessibility.
- [Design System](${SITE_URL}/design-system): Typography, semantic color, spacing, components, page patterns, and widget composition.
- [Widget Catalog](${SITE_URL}/components): Try ratings, Feedback Form, and Survey.
- [Repository](${REPOSITORY_URL}): Canonical source, MIT license, and contributor guidance.

## Widget Documentation (Markdown)

${widgetDocs.map((widget) => `- [${widget.name}](${SITE_URL}/components/${widget.slug}/markdown): ${widget.description}`).join("\n")}

## Blocks (Markdown)

A block installs a ready-made host file for one spot in your app and pulls in its feedback component. Block source is editable and uses your local shadcn theme. Feedback completes locally unless you pass a custom submit handler; the host owns subscription cancellation.

${blockDocs.map((block) => `- [${block.name}](${SITE_URL}/blocks/${block.slug}/markdown): ${block.situationGroup}. ${block.description} Install: \`${block.installCommand}\`.`).join("\n")}

## shadcn Namespace and Agents

Add this entry under registries in your existing components.json:

${code("json", namespaceConfig)}

Then use bunx shadcn@latest add @sentimeter/emoji-feedback (or ${widgetDocs
    .slice(1)
    .map((widget) => `@sentimeter/${widget.registryName}`)
    .join(", ")}).
Full-URL commands in each widget document work without namespace configuration.
Use shadcn's existing MCP integration: https://ui.shadcn.com/docs/mcp. No custom Sentimeter MCP server is needed.
`;
}
