import { directory } from "@/lib/directory";
import { DirectoryCard } from "@/components/landing/directory-card";

const components = directory.filter((entry) => entry.kind === "Component");

export function ComponentGrid() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {components.map((entry) => (
        <li key={entry.href} className="min-w-0">
          <DirectoryCard entry={entry} showKind={false} headingLevel={2} />
        </li>
      ))}
    </ul>
  );
}
