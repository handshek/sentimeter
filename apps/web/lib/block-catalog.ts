import registry from "registry/registry.json";
import { getInstallCommands } from "./widget-catalog";

export type BlockSlug =
  | "floating-feedback"
  | "report-problem"
  | "error-feedback"
  | "was-this-helpful"
  | "after-task-rating"
  | "cancel-flow-survey";

export type BlockSituation =
  "When something breaks" | "After something works" | "When someone leaves";

export type BlockDocConfig = {
  name: string;
  slug: BlockSlug;
  description: string;
  kind: "Block";
  situationGroup: BlockSituation;
  registryName: string;
  installCommand: string;
  namespacedInstallCommand: string;
};

const blockDefinitions: Array<
  Pick<BlockDocConfig, "name" | "slug" | "description" | "situationGroup">
> = [
  {
    name: "Floating feedback button",
    slug: "floating-feedback",
    description:
      "A fixed Feedback pill that opens a popover on desktop and a bottom sheet on phones.",
    situationGroup: "When something breaks",
  },
  {
    name: "Report a problem",
    slug: "report-problem",
    description: "A header button that opens FeedbackForm in a dialog.",
    situationGroup: "When something breaks",
  },
  {
    name: "Error page",
    slug: "error-feedback",
    description:
      "A Next.js error boundary with inline feedback and a Try again action.",
    situationGroup: "When something breaks",
  },
  {
    name: "Was this helpful?",
    slug: "was-this-helpful",
    description: "Inline thumbs under a docs page, help article, or AI answer.",
    situationGroup: "After something works",
  },
  {
    name: "After-task rating",
    slug: "after-task-rating",
    description: "An emoji rating after checkout or another completed task.",
    situationGroup: "After something works",
  },
  {
    name: "Cancel-flow survey",
    slug: "cancel-flow-survey",
    description:
      "A reason survey inside a cancel-subscription dialog with host-owned cancellation.",
    situationGroup: "When someone leaves",
  },
];

export const blockDocs: BlockDocConfig[] = blockDefinitions.map((block) => ({
  ...block,
  kind: "Block",
  registryName: block.slug,
  installCommand: getInstallCommands(block.slug).bun,
  namespacedInstallCommand: `bunx shadcn@latest add @sentimeter/${block.slug}`,
}));

export function getBlockDoc(slug: string) {
  return blockDocs.find((block) => block.slug === slug);
}

export function getBlockFiles(block: BlockDocConfig) {
  const item = registry.items.find(
    (candidate) => candidate.name === block.registryName,
  );
  if (!item) throw new Error(`Missing registry item: ${block.registryName}`);
  return item.files.map((file) => file.target);
}
