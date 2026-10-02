import { LandingPage } from "./_components/landing/landing-page";
import { hasHostedConfiguration } from "./_lib/hosted-config";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return <LandingPage analyticsEnabled={hasHostedConfiguration()} />;
}
import type { Metadata } from "next";
