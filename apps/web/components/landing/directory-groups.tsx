import { entriesFor, situations } from "@/lib/directory";
import { DirectoryCard } from "./directory-card";

export function DirectoryGroups() {
  return (
    <div className="flex flex-col gap-16">
      {situations.map(({ title, lead }) => {
        const entries = entriesFor(title);
        const id = title.toLowerCase().replaceAll(" ", "-");
        return (
          <section key={title} id={id} aria-labelledby={`${id}-title`}>
            <div className="mb-5 space-y-1">
              <h2 id={`${id}-title`} className="ds-section-title">
                {title}
              </h2>
              <p className="ds-body text-muted-foreground">{lead}</p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {entries.map((entry) => (
                <li key={entry.href} className="min-w-0">
                  <DirectoryCard entry={entry} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
