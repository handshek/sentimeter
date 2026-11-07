import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import type { DirectoryEntry } from "@/lib/directory";
import { CardPreview } from "./card-preview";

export function DirectoryCard({ entry }: { entry: DirectoryEntry }) {
  return (
    <Link
      href={entry.href}
      className="group flex min-w-0 flex-col rounded-2xl bg-muted p-1.5 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="h-56 overflow-hidden rounded-xl bg-card ring-1 ring-border">
        <CardPreview id={entry.preview} />
      </div>
      <div className="flex flex-col gap-1 px-2.5 pt-3 pb-2.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="ds-label truncate">{entry.name}</h3>
          <span className="ds-caption shrink-0 font-mono text-muted-foreground">
            {entry.meta}
          </span>
        </div>
        <p className="ds-body-sm line-clamp-2 min-h-10 text-muted-foreground">
          {entry.description}
        </p>
        <p className="ds-caption mt-1.5 flex items-center gap-1.5 text-muted-foreground">
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              entry.kind === "Block" ? "bg-primary" : "bg-muted-foreground",
            )}
          />
          {entry.kind}
        </p>
      </div>
    </Link>
  );
}
