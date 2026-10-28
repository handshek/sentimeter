import Link from "next/link";
import { Activity, ArrowUpRight } from "lucide-react";
import { REPOSITORY_URL } from "@/lib/widget-catalog";
import type { HostedMode } from "@/lib/hosted-config";

export function FooterSection({ hostedMode }: { hostedMode: HostedMode }) {
  const groups = [
    {
      name: "Build",
      links: [
        { href: "/components", label: "Widget collection" },
        { href: "/components/getting-started", label: "Documentation" },
        { href: "/design-system", label: "Design system" },
      ],
    },
    {
      name: "Explore",
      links: [
        { href: REPOSITORY_URL, label: "GitHub" },
        { href: "/llms.txt", label: "For AI agents" },
        ...(hostedMode !== "off"
          ? [
              {
                href: "/dashboard",
                label:
                  hostedMode === "live"
                    ? "Hosted analytics"
                    : "Analytics (soon)",
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <footer className="border-t border-border">
      <div className="ds-container">
        <div className="grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Activity aria-hidden="true" className="size-5 text-brand" />
              Sentimeter
            </Link>
            <p className="ds-label mt-2 max-w-64 font-normal leading-6 text-muted-foreground">
              A small way to listen.
              <br />A thoughtful way to build.
            </p>
          </div>
          {groups.map((group) => (
            <nav key={group.name} aria-label={`Footer ${group.name}`}>
              <p className="ds-eyebrow mb-3 text-muted-foreground">
                {group.name}
              </p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="ds-label inline-flex min-h-11 items-center gap-1.5 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {link.label}
                      {link.href.startsWith("https:") && (
                        <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="ds-caption flex flex-wrap items-center justify-between gap-3 border-t border-border py-5 text-muted-foreground">
          <p>Sentimeter · Open source under the MIT license.</p>
          <nav aria-label="Legal" className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
