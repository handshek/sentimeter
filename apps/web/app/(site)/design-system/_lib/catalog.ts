export const systemChapters = [
  {
    slug: "",
    title: "Overview",
    group: "Start here",
    description: "The principles and shared language behind the whole product.",
  },
  {
    slug: "typography",
    title: "Typography",
    group: "Foundations",
    description: "A useful type scale and a clear reading rhythm.",
  },
  {
    slug: "color",
    title: "Color & surfaces",
    group: "Foundations",
    description:
      "Neutral surfaces, purposeful color, and accessible light and dark themes.",
  },
  {
    slug: "layout",
    title: "Layout & spacing",
    group: "Foundations",
    description:
      "Consistent measures, spacing, corners, and depth at every screen size.",
  },
  {
    slug: "icons-motion",
    title: "Icons & motion",
    group: "Foundations",
    description:
      "A shared visual voice for icons, interaction, and state changes.",
  },
  {
    slug: "components",
    title: "Components",
    group: "Building blocks",
    description:
      "Buttons, fields, navigation, and feedback built from shadcn primitives.",
  },
  {
    slug: "patterns",
    title: "Product patterns",
    group: "In context",
    description:
      "The same foundations composed for marketing, documentation, and product UI.",
  },
  {
    slug: "widgets",
    title: "Feedback widgets",
    group: "In context",
    description:
      "Faces, stars, and thumbs in two layouts, with custom glyphs and dependable states.",
  },
] as const;

export type SystemChapter = (typeof systemChapters)[number];

export function chapterHref(slug: SystemChapter["slug"]) {
  return slug ? `/design-system/${slug}` : "/design-system";
}
