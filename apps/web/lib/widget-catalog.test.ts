import { expect, test } from "bun:test";
import {
  getInstallCommands,
  getUsageSnippet,
  getWidgetDoc,
  widgetDocs,
} from "./widget-catalog";
import { getAgentIndex, getWidgetMarkdown } from "./widget-markdown";
import { docsTree } from "./docs-navigation";
import { REGISTRY_URL } from "registry/site.config";

test("every launch widget has a complete, compatible registry install", () => {
  expect(widgetDocs.map((widget) => widget.slug)).toEqual([
    "emoji-feedback",
    "like-dislike",
    "star-rating",
    "nps",
    "feedback-form",
  ]);

  for (const widget of widgetDocs) {
    const metadata = widget.installMetadata;
    expect(metadata.targetFiles).toContain(metadata.widgetFiles[0]!);
    expect(metadata.targetFiles).toContain(
      "components/sentimeter/feedback-system/core/errors.ts",
    );
    expect(metadata.targetFiles).toContain(
      "components/sentimeter/feedback-system/design-system.ts",
    );
    expect(metadata.widgetFiles).toHaveLength(1);
    expect(metadata.sharedFolder).toBe(
      "components/sentimeter/feedback-system/",
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

test("generated examples keep submission options and stay free of hosted details", () => {
  expect(
    Object.fromEntries(
      widgetDocs.map((widget) => [
        widget.slug,
        getUsageSnippet(widget).includes('layout="inline"'),
      ]),
    ),
  ).toEqual({
    "emoji-feedback": false,
    "like-dislike": true,
    "star-rating": false,
    nps: false,
    "feedback-form": false,
  });
  expect(getWidgetMarkdown(getWidgetDoc("like-dislike")!)).toContain(
    'layout="inline"',
  );
  for (const widget of widgetDocs) {
    const example = getUsageSnippet(
      widget,
      { layout: "inline", followUp: "always", size: "lg" },
      "custom",
    );
    if (widget.preview === "form") {
      expect(example).not.toContain("layout=");
      expect(example).not.toContain("followUp=");
      expect(example).not.toContain("size=");
    } else {
      expect(example).toContain('layout="inline"');
      expect(example).toContain('followUp="always"');
      expect(example).toContain('size="lg"');
    }
    expect(example).not.toContain("autoHide");
    expect(example).toContain("submit={saveFeedback}");
    const markdown = getWidgetMarkdown(widget);
    expect(markdown).not.toContain("apiKey");
    expect(markdown).not.toContain("/dashboard");
    expect(markdown).not.toContain("Hosted Analytics");
    expect(widget.props.map((row) => row.prop)).not.toContain("endpoint");
  }
});

test("NPS docs connect the public item to its source and launch behavior", () => {
  const nps = getWidgetDoc("nps")!;
  expect(nps.componentName).toBe("NpsScore");
  expect(nps.example.followUp).toBe("negative");
  const example = getUsageSnippet(nps, { variant: "emoji" });
  expect(example).toContain("@/components/sentimeter/nps-score");
  expect(example).not.toContain("variant=");
  expect(getWidgetMarkdown(nps)).toContain("NPS 0–6");
  expect(nps.props.map((row) => row.prop)).not.toContain("variant");
  expect(getAgentIndex()).toContain("/components/nps/markdown");
  expect(docsTree.children).toContainEqual({
    type: "page",
    name: "NPS",
    url: "/components/nps",
  });
});

test("FeedbackForm docs describe its payload, context, and container callback", () => {
  const form = getWidgetDoc("feedback-form")!;
  expect(form.componentName).toBe("FeedbackForm");
  expect(getUsageSnippet(form)).toContain(
    "@/components/sentimeter/feedback-form",
  );
  expect(form.props.map((row) => row.prop)).toContain("onDone");
  expect(form.props.map((row) => row.prop)).not.toContain("followUp");
  const markdown = getWidgetMarkdown(form);
  expect(markdown).toContain('widgetType: "form"');
  expect(markdown).toContain("window.innerWidth/innerHeight in CSS pixels");
  expect(markdown).toContain("including query string and hash");
  expect(markdown).toContain("Unmounting cancels the pending callback");
  expect(markdown).not.toContain('layout="inline"');
  expect(markdown).not.toContain("Negative means");
  expect(getAgentIndex()).toContain("/components/feedback-form/markdown");
  expect(docsTree.children).toContainEqual({
    type: "page",
    name: "Feedback Form",
    url: "/components/feedback-form",
  });
});
