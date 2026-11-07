import registry from "registry/registry.json";
import { getInstallCommands, type WidgetDocRow } from "./widget-catalog";

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
  props: WidgetDocRow[];
};

const row = (
  prop: string,
  type: string,
  defaultValue: string,
  description: string,
): WidgetDocRow => ({ prop, type, defaultValue, description });

const submitRow = (payload: string) =>
  row(
    "submit",
    `WidgetSubmit<${payload}>`,
    "-",
    "Async handler that saves the feedback. Without it, the form completes locally.",
  );

const blockProps: Record<BlockSlug, WidgetDocRow[]> = {
  "floating-feedback": [
    submitRow("FormPayload"),
    row(
      "corner",
      '"bottom-right" | "bottom-left"',
      '"bottom-right"',
      "Which corner the button sits in.",
    ),
    row("label", "string", '"Feedback"', "Text on the button."),
    row(
      "location",
      "string",
      '"floating-feedback"',
      "Identifier sent with every report.",
    ),
  ],
  "report-problem": [
    submitRow("FormPayload"),
    row(
      "label",
      "string",
      '"Report a problem"',
      "Text on the button that opens the dialog.",
    ),
    row(
      "location",
      "string",
      '"report-problem"',
      "Identifier sent with every report.",
    ),
  ],
  "error-feedback": [
    row(
      "error",
      "Error & { digest?: string }",
      "-",
      "Passed by Next.js. Only the digest is sent, as the report location.",
    ),
    row(
      "reset",
      "() => void",
      "-",
      "Passed by Next.js. Try again calls it to re-render the segment.",
    ),
  ],
  "was-this-helpful": [
    submitRow("RatingPayload"),
    row(
      "title",
      "ReactNode",
      '"Was this helpful?"',
      "The question beside the thumbs.",
    ),
    row(
      "location",
      "string",
      '"was-this-helpful"',
      "Identifier sent with every rating, such as the page slug.",
    ),
  ],
  "after-task-rating": [
    submitRow("RatingPayload"),
    row(
      "done",
      "string",
      '"Order placed"',
      "The success line above the rating.",
    ),
    row("question", "string", '"How was checkout?"', "The rating question."),
    row(
      "location",
      "string",
      '"after-task"',
      "Identifier sent with every rating.",
    ),
  ],
  "cancel-flow-survey": [
    row(
      "cancelPlan",
      "() => void | Promise<void>",
      "required",
      "Your real cancellation. It runs after the reason is sent; if it throws, the reason is kept for retry.",
    ),
    submitRow("SurveyPayload"),
    row("planName", "string", '"Pro"', "Plan name in the dialog title."),
    row(
      "endsOn",
      "string",
      "-",
      'When the plan ends, such as "30 Nov". Without it, the dialog says the end of this billing period.',
    ),
    row(
      "location",
      "string",
      '"cancel-flow"',
      "Identifier sent with every reason.",
    ),
  ],
};

const blockDefinitions: Array<
  Pick<BlockDocConfig, "name" | "slug" | "description" | "situationGroup">
> = [
  {
    name: "Floating feedback button",
    slug: "floating-feedback",
    description:
      "A feedback button that stays in the corner of every page and opens the feedback form.",
    situationGroup: "When something breaks",
  },
  {
    name: "Report a problem",
    slug: "report-problem",
    description:
      "A “Report a problem” button that opens the feedback form in a dialog.",
    situationGroup: "When something breaks",
  },
  {
    name: "Error page",
    slug: "error-feedback",
    description:
      "A Next.js error page that asks users what they were doing when your app broke.",
    situationGroup: "When something breaks",
  },
  {
    name: "Was this helpful?",
    slug: "was-this-helpful",
    description:
      "Thumbs up or down under a docs page, help article or AI answer.",
    situationGroup: "After something works",
  },
  {
    name: "After-task rating",
    slug: "after-task-rating",
    description:
      "An emoji rating that appears after checkout, onboarding or any finished task.",
    situationGroup: "After something works",
  },
  {
    name: "Cancel-flow survey",
    slug: "cancel-flow-survey",
    description:
      "A cancellation dialog that asks why users are leaving before they cancel.",
    situationGroup: "When someone leaves",
  },
];

export const blockDocs: BlockDocConfig[] = blockDefinitions.map((block) => ({
  ...block,
  kind: "Block",
  registryName: block.slug,
  installCommand: getInstallCommands(block.slug).bun,
  namespacedInstallCommand: `bunx shadcn@latest add @sentimeter/${block.slug}`,
  props: blockProps[block.slug],
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
