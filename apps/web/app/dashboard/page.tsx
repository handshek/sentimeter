import { ProjectsClient } from "./_components/projects-client";

export const metadata = {
  title: "Dashboard",
  description: "Your Sentimeter analytics dashboard",
};

export default function DashboardPage() {
  return <ProjectsClient />;
}
