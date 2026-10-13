import type { Metadata } from "next";
import { ProjectsClient } from "./_components/projects-client";
import { hostedMode } from "../_lib/hosted-config";

export function generateMetadata(): Metadata {
  return hostedMode() === "live"
    ? { title: "Dashboard", description: "Your Sentimeter analytics dashboard" }
    : {
        title: "Hosted analytics",
        description:
          "Hosted Sentimeter analytics is coming. Follow the repository or join the waitlist for launch updates.",
      };
}

export default function DashboardPage() {
  return <ProjectsClient />;
}
