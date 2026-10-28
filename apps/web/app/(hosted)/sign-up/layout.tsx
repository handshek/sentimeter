import type { ReactNode } from "react";
import { HostedProviders } from "@/components/providers/hosted-providers";

export default function SignUpLayout({ children }: { children: ReactNode }) {
  return <HostedProviders>{children}</HostedProviders>;
}
