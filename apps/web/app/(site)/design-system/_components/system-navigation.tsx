"use client";

import { useId } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import {
  chapterHref,
  systemChapters,
} from "@/app/(site)/design-system/_lib/catalog";

const groups = [...new Set(systemChapters.map((chapter) => chapter.group))];

export function SystemNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const selectId = useId();
  const active = systemChapters.find(
    (chapter) => chapterHref(chapter.slug) === pathname.replace(/\/$/, ""),
  );

  return (
    <>
      <div className="space-y-2 lg:hidden">
        <Label htmlFor={selectId} className="ds-label text-muted-foreground">
          Explore the design system
        </Label>
        <Select
          value={chapterHref(active?.slug ?? "")}
          onValueChange={(href) => {
            if (
              systemChapters.some(
                (chapter) => chapterHref(chapter.slug) === href,
              )
            )
              router.push(href);
          }}
        >
          <SelectTrigger id={selectId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {groups.map((group) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {systemChapters
                  .filter((chapter) => chapter.group === group)
                  .map((chapter) => (
                    <SelectItem
                      key={chapter.slug}
                      value={chapterHref(chapter.slug)}
                      className="min-h-11"
                    >
                      {chapter.title}
                    </SelectItem>
                  ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
      <nav
        aria-label="Design system chapters"
        className="hidden space-y-7 lg:block"
      >
        {groups.map((group) => (
          <div key={group}>
            <p className="ds-eyebrow mb-2 px-3 text-muted-foreground">
              {group}
            </p>
            <ul className="space-y-0.5">
              {systemChapters
                .filter((chapter) => chapter.group === group)
                .map((chapter) => (
                  <li key={chapter.slug}>
                    <Link
                      href={chapterHref(chapter.slug)}
                      aria-current={
                        active?.slug === chapter.slug ? "page" : undefined
                      }
                      className={cn(
                        "ds-label flex min-h-11 items-center rounded-md px-3 transition-colors focus-visible:ds-focus",
                        active?.slug === chapter.slug
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      {chapter.title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
