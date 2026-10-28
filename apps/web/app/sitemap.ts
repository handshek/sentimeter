import type { MetadataRoute } from "next";
import { SITE_URL, widgetDocs } from "@/lib/widget-catalog";
import {
  systemChapters,
  chapterHref,
} from "./(site)/design-system/_lib/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/components",
    "/components/getting-started",
    "/privacy",
    ...widgetDocs.map((widget) => `/components/${widget.slug}`),
    ...systemChapters.map((chapter) => chapterHref(chapter.slug)),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
