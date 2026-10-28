import { expect, test } from "bun:test";
import {
  getInstallCommands,
  getUsageSnippet,
  getWidgetDoc,
  widgetDocs,
} from "./widget-catalog";
import { getWidgetMarkdown } from "./widget-markdown";
import { REGISTRY_URL } from "registry/site.config";

test("every launch widget has a complete, compatible registry install", () => {
  expect(widgetDocs.map((widget) => widget.slug)).toEqual([
    "emoji-feedback",
    "like-dislike",
    "star-rating",
  ]);

  for (const widget of widgetDocs) {
    const metadata = widget.installMetadata;
    expect(metadata.targetFiles).toHaveLength(15);
    expect(metadata.sharedFileCount).toBe(14);
    expect(metadata.targetFiles).toContain(
      `components/sentimeter/${widget.slug}.tsx`,
    );
    expect(metadata.targetFiles).toContain(
      "components/sentimeter/feedback-system/core/errors.ts",
    );
    expect(metadata.targetFiles).toContain(
      "components/sentimeter/feedback-system/design-system.ts",
    );
    expect(metadata.shadcnDependencies).toEqual([
      "button",
      "textarea",
      "label",
    ]);
    expect(metadata.packageDependencies).toEqual(["lucide-react"]);
    expect(getInstallCommands(widget.registryName).bun).toBe(
      `bunx shadcn@latest add "${REGISTRY_URL}/r/${widget.slug}.json"`,
    );
  }
  expect(getWidgetDoc("not-a-widget")).toBeUndefined();
});

test("generated examples keep the layout alongside submission options", () => {
  for (const widget of widgetDocs) {
    expect(getUsageSnippet(widget)).not.toContain("layout=");
    const example = getUsageSnippet(
      widget,
      { layout: "inline", showInput: true, size: "lg" },
      "custom",
    );
    expect(example).toContain('layout="inline"');
    expect(example).toContain("showInput");
    expect(example).toContain('size="lg"');
    expect(example).toContain("submit={saveFeedback}");
    const markdown = getWidgetMarkdown(widget);
    expect(markdown).not.toContain("apiKey");
    expect(markdown).not.toContain("/dashboard");
    expect(markdown).not.toContain("Hosted Analytics");
    expect(widget.props.map((row) => row.prop)).not.toContain("endpoint");
    expect(markdown).toContain('| location | string | "/" |');
    expect(markdown).toContain("| layout |");
    expect(markdown).toContain("| style | FeedbackStyle |");
    expect(markdown).toContain("/design-system");
  }
});
