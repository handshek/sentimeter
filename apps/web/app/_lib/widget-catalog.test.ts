import { expect, test } from "bun:test";
import { getInstallCommands, getWidgetDoc, widgetDocs } from "./widget-catalog";

test("every launch widget has a complete, compatible registry install", () => {
  expect(widgetDocs.map((widget) => widget.slug)).toEqual([
    "emoji-feedback",
    "like-dislike",
    "star-rating",
  ]);

  for (const widget of widgetDocs) {
    const metadata = widget.installMetadata;
    expect(metadata.targetFiles).toHaveLength(13);
    expect(metadata.targetFiles).toContain(
      `components/sentimeter/${widget.slug}.tsx`,
    );
    expect(metadata.targetFiles).toContain(
      "components/sentimeter/feedback-system/core/submit.ts",
    );
    expect(metadata.shadcnDependencies).toEqual(["button", "textarea"]);
    expect(metadata.packageDependencies).toEqual(["lucide-react"]);
    expect(getInstallCommands(widget.registryName).bun).toBe(
      `bunx shadcn@latest add "https://registry.handshek.workers.dev/r/${widget.slug}.json"`,
    );
  }
  expect(getWidgetDoc("not-a-widget")).toBeUndefined();
});
