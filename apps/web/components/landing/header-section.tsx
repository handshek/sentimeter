import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, Github, Menu, Search, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { REPOSITORY_URL } from "@/lib/widget-catalog";
import { ThemeToggle } from "@/components/theme-toggle";

export const siteLinks = [
  { href: "/components", label: "Components" },
  { href: "/components/getting-started", label: "Docs" },
] as const;

export const searchTriggerClassName =
  "text-muted-foreground md:w-56 md:justify-start md:gap-2 md:border md:border-border md:bg-muted/40 md:px-2.5 md:font-normal";

export function SearchTriggerContent({ shortcut }: { shortcut?: boolean }) {
  return (
    <>
      <Search aria-hidden="true" className="size-4" />
      <span className="max-md:sr-only">Search</span>
      {shortcut ? (
        <kbd className="ml-auto hidden rounded border border-border bg-background px-1.5 font-sans text-xs md:inline">
          ⌘K
        </kbd>
      ) : null}
    </>
  );
}

// Search lives in the docs shell; elsewhere the trigger opens it there.
function SearchLink() {
  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={searchTriggerClassName}
    >
      <Link href="/components#search">
        <SearchTriggerContent />
      </Link>
    </Button>
  );
}

export function HeaderSection({
  className,
  search = <SearchLink />,
  menu = <MobileMenu />,
}: {
  className?: string;
  search?: ReactNode;
  menu?: ReactNode;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-6 px-4 md:px-6">
        <Link
          href="/"
          aria-label="Sentimeter home"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Activity aria-hidden="true" className="size-5 text-brand" />
          Sentimeter
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {siteLinks.map((link) => (
            <Button
              key={link.href}
              asChild
              variant="ghost"
              className="px-3 text-muted-foreground"
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          {search}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
          >
            <a href={REPOSITORY_URL} aria-label="Sentimeter on GitHub">
              <Github aria-hidden="true" className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
          {menu}
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} className="gap-6 p-6">
        <SheetHeader className="p-0 pr-10">
          <SheetTitle className="ds-title">Sentimeter</SheetTitle>
          <SheetDescription>
            Feedback components for shadcn apps.
          </SheetDescription>
        </SheetHeader>
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3"
            aria-label="Close navigation"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </SheetClose>
        <nav aria-label="Mobile" className="flex flex-col gap-2">
          {siteLinks.map((link) => (
            <SheetClose asChild key={link.href}>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="justify-start px-3"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            </SheetClose>
          ))}
          <SheetClose asChild>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="justify-start px-3"
            >
              <a href={REPOSITORY_URL}>
                <Github aria-hidden="true" className="size-4" /> GitHub
              </a>
            </Button>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
