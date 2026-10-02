import { LandingPage } from "./_components/landing/landing-page";
import { hasHostedConfiguration } from "./_lib/hosted-config";

export default function Home() {
  return <LandingPage analyticsEnabled={hasHostedConfiguration()} />;
}
