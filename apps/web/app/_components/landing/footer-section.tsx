import Link from "next/link";
import { REPOSITORY_URL } from "../../_lib/widget-catalog";

export function FooterSection({
  analyticsEnabled,
}: {
  analyticsEnabled: boolean;
}) {
  const links = [
    { href: "/components", label: "Documentation" },
    { href: "/components/getting-started", label: "Getting Started" },
    { href: "/llms.txt", label: "llms.txt" },
    { href: REPOSITORY_URL, label: "GitHub" },
    ...(analyticsEnabled
      ? [{ href: "/dashboard", label: "Optional Analytics" }]
      : []),
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ];
  return (
    <footer className="border-t border-border px-4 py-6 text-sm text-muted-foreground sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>Sentimeter · Open source · MIT</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
