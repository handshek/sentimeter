import type { ReactNode } from "react";

export function SystemHeading({
  title,
  description,
  eyebrow = "Sentimeter design system",
}: {
  title: string;
  description: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="space-y-5 border-b border-border pb-10 sm:pb-12">
      <p className="ds-eyebrow text-muted-foreground">{eyebrow}</p>
      <h1 className="ds-page-title">{title}</h1>
      <p className="ds-lead max-w-2xl text-muted-foreground">{description}</p>
    </header>
  );
}

export function SystemSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="scroll-mt-28 space-y-6 border-b border-border py-10 last:border-b-0 sm:py-12"
    >
      <div className="space-y-3">
        <h2 id={id} className="ds-title scroll-mt-28">
          {title}
        </h2>
        {description && (
          <p className="ds-body max-w-2xl text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export function UsageNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-2 border-primary/40 py-1 pl-4 ds-body-sm text-muted-foreground">
      {children}
    </div>
  );
}
