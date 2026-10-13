import type { Metadata } from "next";
import { LandingPage } from "./_components/landing/landing-page";
import { hostedMode } from "./_lib/hosted-config";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return <LandingPage hostedMode={hostedMode()} />;
}
