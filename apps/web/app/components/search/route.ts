import { createSearchAPI } from "fumadocs-core/search/server";
import { widgetDocs } from "../../_lib/widget-catalog";
import { getWidgetMarkdown } from "../../_lib/widget-markdown";
import { gettingStartedSections } from "../../_lib/docs-navigation";

// This public route intentionally sits outside the hosted /api auth boundary.
export const { GET } = createSearchAPI("simple", {
  indexes: [
    {
      title: "Feedback Widgets",
      url: "/components",
      content:
        "Open-source React feedback widgets for shadcn apps. Emoji, thumbs and stars. MIT licensed source you own.",
    },
    ...gettingStartedSections.map((section) => ({
      title: section.title,
      url: `/components/getting-started${section.url}`,
      breadcrumbs: ["Getting Started"],
      content: section.content,
    })),
    ...widgetDocs.map((widget) => ({
      title: widget.name,
      description: widget.description,
      url: `/components/${widget.slug}`,
      content: getWidgetMarkdown(widget),
    })),
  ],
});
