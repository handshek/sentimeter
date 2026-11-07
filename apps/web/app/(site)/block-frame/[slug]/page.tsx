import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockStage } from "@/components/docs/block-stage";
import { blockDocs, getBlockDoc } from "@/lib/block-catalog";

export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return blockDocs.map((block) => ({ slug: block.slug }));
}

export default async function BlockFrame({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const block = getBlockDoc((await params).slug);
  if (!block) notFound();
  return (
    <main className="h-dvh overflow-y-auto bg-background text-foreground">
      <BlockStage slug={block.slug} />
    </main>
  );
}
