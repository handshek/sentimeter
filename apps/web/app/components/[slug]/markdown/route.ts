import { getWidgetDoc, widgetDocs } from "../../../_lib/widget-catalog";
import { getWidgetMarkdown } from "../../../_lib/widget-markdown";

export const dynamic = "force-static";

export function generateStaticParams() {
  return widgetDocs.map((widget) => ({ slug: widget.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const widget = getWidgetDoc((await params).slug);
  if (!widget) return new Response("Widget not found.", { status: 404 });
  return new Response(getWidgetMarkdown(widget), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
