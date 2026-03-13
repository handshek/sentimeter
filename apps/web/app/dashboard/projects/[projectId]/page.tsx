import { ProjectClient } from "../../_components/project-client";

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <ProjectClient projectId={params.projectId} />;
}
