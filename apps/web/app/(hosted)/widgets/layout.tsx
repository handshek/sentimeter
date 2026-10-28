import type { ReactNode } from "react";
import { hostedMode } from "@/lib/hosted-config";
import { HostedProviders } from "@/components/providers/hosted-providers";

export default function WidgetsLayout({ children }: { children: ReactNode }) {
  // Legacy /widgets/:slug links must still redirect when hosted setup is absent.
  return hostedMode() === "live" ? (
    <HostedProviders withConvex>{children}</HostedProviders>
  ) : (
    children
  );
}
