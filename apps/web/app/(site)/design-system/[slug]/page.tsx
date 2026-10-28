import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ComponentSpecimens } from "../_components/component-specimens";
import {
  ColorSpecimens,
  LayoutSpecimens,
} from "../_components/foundation-specimens";
import { IconMotionSpecimens } from "../_components/icon-motion-specimens";
import { PatternSpecimens } from "../_components/pattern-specimens";
import { SystemHeading } from "../_components/system-section";
import { TypographySpecimens } from "../_components/typography-specimens";
import { WidgetSpecimens } from "../_components/widget-specimens";
import { chapterHref, systemChapters } from "../_lib/catalog";

const specimens = {
  typography: TypographySpecimens,
  color: ColorSpecimens,
  layout: LayoutSpecimens,
  "icons-motion": IconMotionSpecimens,
  components: ComponentSpecimens,
  patterns: PatternSpecimens,
  widgets: WidgetSpecimens,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return systemChapters
    .filter((chapter) => chapter.slug)
    .map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = systemChapters.find((entry) => entry.slug === slug);
  if (!chapter) notFound();
  return {
    title: chapter.title,
    description: chapter.description,
    alternates: { canonical: chapterHref(chapter.slug) },
  };
}

export default async function SystemChapterPage({ params }: Props) {
  const { slug } = await params;
  const index = systemChapters.findIndex((entry) => entry.slug === slug);
  const chapter = systemChapters[index];
  if (!chapter || !chapter.slug) notFound();
  const Specimens = specimens[chapter.slug];
  const previous = systemChapters[index - 1];
  const next = systemChapters[index + 1];
  return (
    <>
      <SystemHeading
        title={chapter.title}
        description={chapter.description}
        eyebrow={chapter.group}
      />
      <Specimens />
      <nav
        aria-label="Adjacent chapters"
        className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-8"
      >
        {previous && (
          <Link
            href={chapterHref(previous.slug)}
            className="group flex min-h-11 items-center gap-3 rounded-md py-2 text-sm focus-visible:ds-focus"
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
            <span>
              <span className="ds-caption block text-muted-foreground">
                Previous
              </span>
              <span className="font-medium group-hover:underline">
                {previous.title}
              </span>
            </span>
          </Link>
        )}
        {next && (
          <Link
            href={chapterHref(next.slug)}
            className="group col-start-2 flex min-h-11 items-center justify-end gap-3 rounded-md py-2 text-right text-sm focus-visible:ds-focus"
          >
            <span>
              <span className="ds-caption block text-muted-foreground">
                Next
              </span>
              <span className="font-medium group-hover:underline">
                {next.title}
              </span>
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
          </Link>
        )}
      </nav>
    </>
  );
}
