import { blockDocs } from "./block-catalog";
import { widgetDocs } from "./widget-catalog";

export type Situation =
  "When something breaks" | "After something works" | "When someone leaves";

export type PreviewId =
  | "form"
  | "floating-feedback"
  | "report-problem"
  | "error-feedback"
  | "emoji"
  | "thumbs"
  | "star"
  | "nps"
  | "was-this-helpful"
  | "after-task-rating"
  | "survey"
  | "cancel-flow-survey";

export type DirectoryEntry = {
  name: string;
  href: string;
  description: string;
  meta: string;
  kind: "Component" | "Block";
  situation: Situation;
  preview: PreviewId;
};

export const situations: { title: Situation; lead: string }[] = [
  {
    title: "When something breaks",
    lead: "Give frustrated users one obvious place to say what went wrong.",
  },
  {
    title: "After something works",
    lead: "Ask how it went right after a task, in one tap.",
  },
  {
    title: "When someone leaves",
    lead: "Learn why people cancel without a long survey.",
  },
];

const componentCopy: Record<
  string,
  Pick<DirectoryEntry, "description" | "meta" | "situation">
> = {
  form: {
    description:
      "“What happened?” plus one text box. Page and browser details attach on their own.",
    meta: "popover · sheet",
    situation: "When something breaks",
  },
  emoji: {
    description:
      "Five faces. A sad pick asks what went wrong; a happy pick says thanks.",
    meta: "stacked · inline",
    situation: "After something works",
  },
  thumbs: {
    description: "Yes or no. A thumbs down asks what went wrong.",
    meta: "stacked · inline",
    situation: "After something works",
  },
  star: {
    description: "One to five stars. One or two stars ask what went wrong.",
    meta: "stacked · inline",
    situation: "After something works",
  },
  nps: {
    description:
      "How likely to recommend. Low scores ask what would make it better.",
    meta: "0–10",
    situation: "After something works",
  },
  survey: {
    description: "Pick one reason, then add an optional note.",
    meta: "reasons + note",
    situation: "When someone leaves",
  },
};

const blockMeta: Record<string, string> = {
  "floating-feedback": "1 file",
  "report-problem": "1 file",
  "error-feedback": "error.tsx",
  "was-this-helpful": "1 file",
  "after-task-rating": "1 file",
  "cancel-flow-survey": "1 file",
};

export const directory: DirectoryEntry[] = [
  ...widgetDocs.map((widget) => {
    const copy = componentCopy[widget.preview];
    if (!copy) throw new Error(`Missing directory copy: ${widget.slug}`);
    return {
      name: widget.name,
      href: `/components/${widget.slug}`,
      kind: "Component" as const,
      preview: widget.preview,
      ...copy,
    };
  }),
  ...blockDocs.map((block) => ({
    name: block.name,
    href: `/components/blocks/${block.slug}`,
    description: block.description,
    meta: blockMeta[block.slug] ?? "1 file",
    kind: "Block" as const,
    situation: block.situationGroup,
    preview: block.slug,
  })),
];

const order: PreviewId[] = [
  "form",
  "floating-feedback",
  "report-problem",
  "error-feedback",
  "emoji",
  "thumbs",
  "star",
  "nps",
  "was-this-helpful",
  "after-task-rating",
  "survey",
  "cancel-flow-survey",
];

export function entriesFor(situation: Situation) {
  return directory
    .filter((entry) => entry.situation === situation)
    .sort((a, b) => order.indexOf(a.preview) - order.indexOf(b.preview));
}
