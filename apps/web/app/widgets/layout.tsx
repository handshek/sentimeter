import type { ReactNode } from "react";
import { hasHostedConfiguration } from "../_lib/hosted-config";
import { HostedProviders } from "../components/hosted-providers";

export default function WidgetsLayout({ children }: { children: ReactNode }) {
  // Legacy /widgets/:slug links must still redirect when hosted setup is absent.
  return hasHostedConfiguration() ? (
    <HostedProviders withConvex>{children}</HostedProviders>
  ) : (
    children
  );
}
