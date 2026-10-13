import Link from "next/link";
import { Activity, ArrowUpRight, Github, Menu, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { REPOSITORY_URL } from "../../_lib/widget-catalog";
import type { HostedMode } from "../../_lib/hosted-config";
import { ThemeToggle } from "../theme-toggle";

export function HeaderSection({ hostedMode }: { hostedMode: HostedMode }) {
  const links = [
    { href: "/#widgets", label: "Widgets" },
    { href: "/components/getting-started", label: "Documentation" },
    { href: "/design-system", label: "Design system" },
    ...(hostedMode !== "off"
      ? [
          {
            href: "/dashboard",
            label: hostedMode === "live" ? "Analytics" : "Analytics (soon)",
          },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="ds-container flex min-h-20 items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Sentimeter home"
          className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Activity aria-hidden="true" className="size-5 text-brand" />
          <span className="text-lg">Sentimeter</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
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
        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
          >
            <a href={REPOSITORY_URL} aria-label="Sentimeter on GitHub">
              <Github aria-hidden="true" className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
          <Button
            asChild
            variant="outline"
            className="ml-2 hidden lg:inline-flex"
          >
            <Link href="/components">
              Browse widgets{" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu aria-hidden="true" className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent showCloseButton={false} className="gap-6 p-6">
              <SheetHeader className="p-0 pr-10">
                <SheetTitle className="ds-title">Sentimeter</SheetTitle>
                <SheetDescription>
                  Feedback components, made to feel at home.
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
                {links.map((link) => (
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
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/components">
                    Browse widgets{" "}
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </Link>
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
