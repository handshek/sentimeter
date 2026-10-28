import { cn } from "@workspace/ui/lib/utils";
import { Card } from "@workspace/ui/components/card";

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card size="sm" className={cn("ds-panel gap-0 px-5 ring-0", className)}>
      {children}
    </Card>
  );
}
