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
      "A small pill bottom-right on every page that opens the Feedback Form.",
    situationGroup: "When something breaks",
  },
  {
    name: "Report a problem",
    slug: "report-problem",
    description:
      "A header or account-menu item that opens the Feedback Form in a dialog.",
    situationGroup: "When something breaks",
  },
  {
    name: "Error page",
    slug: "error-feedback",
    description:
      "A Next.js error page that asks what the user was doing when it broke.",
    situationGroup: "When something breaks",
  },
  {
    name: "Was this helpful?",
    slug: "was-this-helpful",
    description: "Thumbs under a docs page or an AI answer.",
    situationGroup: "After something works",
  },
  {
    name: "After-task rating",
    slug: "after-task-rating",
    description: "A rating that appears once checkout or onboarding finishes.",
    situationGroup: "After something works",
  },
  {
    name: "Cancel-flow survey",
    slug: "cancel-flow-survey",
    description: "“Why are you leaving?” inside the cancel dialog.",
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
