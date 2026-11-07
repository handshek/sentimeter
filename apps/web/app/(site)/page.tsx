import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";
import { hostedMode } from "@/lib/hosted-config";

export const metadata: Metadata = {
  title: {
    absolute: "Sentimeter: feedback components for shadcn/ui and React",
  },
  alternates: { canonical: "/" },
};

export default function Home() {
  return <LandingPage hostedMode={hostedMode()} />;
}
