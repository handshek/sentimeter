import type { ReactNode } from "react";
import { HostedProviders } from "../components/hosted-providers";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return <HostedProviders>{children}</HostedProviders>;
}
