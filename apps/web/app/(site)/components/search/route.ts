import { createSearchAPI } from "fumadocs-core/search/server";
import { widgetDocs } from "@/lib/widget-catalog";
import { getWidgetMarkdown } from "@/lib/widget-markdown";
import {
  designSystemSections,
  gettingStartedSections,
} from "@/lib/docs-navigation";

// This public route intentionally sits outside the hosted /api auth boundary.
export const { GET } = createSearchAPI("simple", {
  indexes: [
    {
      title: "Components",
      url: "/components",
      content:
        "Open-source feedback components and blocks for React and shadcn/ui: a feedback form, ratings, NPS and a cancellation survey. MIT licensed source you own.",
    },
    ...gettingStartedSections.map((section) => ({
      title: section.title,
      url: `/components/getting-started${section.url}`,
      breadcrumbs: ["Docs"],
      content: section.content,
    })),
    ...designSystemSections.map((section) => ({
      title: section.title,
      url: section.url,
      breadcrumbs: ["Design system"],
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
