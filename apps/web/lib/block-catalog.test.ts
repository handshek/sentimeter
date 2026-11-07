import { expect, test } from "bun:test";
import { blockDocs, getBlockDoc, getBlockFiles } from "./block-catalog";
import { getBlockMarkdown } from "./block-markdown";
import { getAgentIndex } from "./widget-markdown";
import { REGISTRY_URL, SITE_URL } from "registry/site.config";
import { GET } from "@/app/(site)/components/blocks/[slug]/markdown/route";

test("the six blocks expose URL installs and planned namespaced commands", () => {
  expect(blockDocs.map((block) => block.slug)).toEqual([
    "floating-feedback",
    "report-problem",
    "error-feedback",
    "was-this-helpful",
    "after-task-rating",
    "cancel-flow-survey",
  ]);
  expect(blockDocs.map((block) => block.situationGroup)).toEqual([
    "When something breaks",
    "When something breaks",
    "When something breaks",
    "After something works",
    "After something works",
    "When someone leaves",
  ]);
  for (const block of blockDocs) {
    expect(block.kind).toBe("Block");
    expect(block.installCommand).toBe(
      `bunx shadcn@latest add "${REGISTRY_URL}/r/${block.slug}.json"`,
    );
    expect(block.namespacedInstallCommand).toBe(
      `bunx shadcn@latest add @sentimeter/${block.slug}`,
    );
    expect(getBlockFiles(block)).toContain(
      block.slug === "error-feedback"
        ? "app/error.tsx"
        : `components/sentimeter/blocks/${block.slug}.tsx`,
    );
  }
  expect(getBlockDoc("not-a-block")).toBeUndefined();
});

test("agent and Markdown documents describe every installable block", async () => {
  const index = getAgentIndex();
  for (const block of blockDocs) {
    expect(index).toContain(
      `${SITE_URL}/components/blocks/${block.slug}/markdown`,
    );
    expect(index).toContain(block.installCommand);
    const response = await GET(new Request("https://example.com"), {
      params: Promise.resolve({ slug: block.slug }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    const markdown = await response.text();
    expect(markdown).toContain(`# ${block.name}`);
    expect(markdown).toContain(block.installCommand);
    expect(markdown).toContain("sends or stores nothing");
    for (const file of getBlockFiles(block)) {
      expect(markdown).toContain(file);
    }
  }
  expect(getBlockMarkdown(getBlockDoc("cancel-flow-survey")!)).toContain(
    "neither callback cancels a subscription by itself",
  );
  expect(getBlockMarkdown(getBlockDoc("error-feedback")!)).toContain(
    "Try again calls reset",
  );
});

test("an unknown block Markdown document returns 404", async () => {
  const response = await GET(new Request("https://example.com"), {
    params: Promise.resolve({ slug: "not-a-block" }),
  });
  expect(response.status).toBe(404);
  expect(await response.text()).toBe("Block not found.");
});
