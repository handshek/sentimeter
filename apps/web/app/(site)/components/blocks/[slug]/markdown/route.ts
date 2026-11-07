import { blockDocs, getBlockDoc } from "@/lib/block-catalog";
import { getBlockMarkdown } from "@/lib/block-markdown";

export const dynamic = "force-static";

export function generateStaticParams() {
  return blockDocs.map((block) => ({ slug: block.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const block = getBlockDoc((await params).slug);
  if (!block) return new Response("Block not found.", { status: 404 });
  return new Response(getBlockMarkdown(block), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
