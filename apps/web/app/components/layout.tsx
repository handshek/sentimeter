import type { ReactNode } from "react";
import { ComponentsLayoutShell } from "./_components/widget-docs-shell";

export default function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ComponentsLayoutShell>{children}</ComponentsLayoutShell>;
}
