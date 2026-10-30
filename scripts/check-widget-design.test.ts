import { describe, expect, test } from "bun:test";
import { inspectWidgetDesign } from "./check-widget-design";

const widgetPath = "packages/widgets/src/compound/feedback-example.tsx";

function rules(source: string, path = widgetPath) {
  return inspectWidgetDesign(path, source).map((finding) => finding.rule);
}

describe("widget design guard", () => {
  test.each([
    '<Card className="bg-[#6d28d9]" />',
    '<Card style={{ color: "rgba(1, 2, 3, 0.5)" }} />',
    '<Card style={{ color: "oklch(0.5 0.2 120)" }} />',
    'const color = "#11223344";',
  ])("rejects literal colors: %s", (source) => {
    expect(rules(source)).toEqual(["widget/raw-color"]);
  });

  test.each([
    '<Card className="dark:bg-violet-900/50" />',
    '<Card className="border-x-slate-200 hover:text-red-500" />',
    '<Star className="fill-yellow-400!" />',
    '<Card className="bg-white" />',
    'const classes = `p-4 ${active ? "bg-blue-500" : "bg-card"}`;',
  ])("rejects palette choices: %s", (source) => {
    expect(rules(source)).toEqual(["widget/palette-color"]);
  });

  test.each([
    '<button\n type="button"\n onClick={submit}>Submit</button>',
    '<textarea aria-label="Comment" />',
    '<input aria-label="Email" />',
    '<label htmlFor="comment">Additional feedback</label>',
  ])("rejects duplicated primitive controls: %s", (source) => {
    expect(rules(source)).toEqual(["widget/raw-control"]);
  });

  test.each([
    '<Card className="rounded-[13px]" />',
    '<Card className="focus:rounded-t-[0.4rem]" />',
    '<Card className="shadow-[0_2px_4px_black]" />',
    "<Card style={{ borderRadius: 13 }} />",
    '<Card style={{ boxShadow: "0 2px 4px currentColor" }} />',
  ])("rejects independent shape values: %s", (source) => {
    expect(rules(source)).toEqual(["widget/raw-shape"]);
  });

  test("accepts semantic recipes, scoped variables and ordinary layout", () => {
    expect(
      rules(`
        import { Button } from "@workspace/ui/components/button";
        import { Textarea } from "@workspace/ui/components/textarea";
        import { Input } from "@workspace/ui/components/input";
        import { Label } from "@workspace/ui/components/label";
        import { feedbackStyles } from "../design-system";
        const body = <div className="grid gap-3 p-4 max-w-[320px]">
          <Button className={feedbackStyles.action}>Submit</Button>
          <Textarea className="bg-card text-foreground border-input" />
          <Label htmlFor="email">Email</Label>
          <Input id="email" className="bg-input text-foreground" />
          <div className="rounded-[var(--feedback-radius)] shadow-[var(--feedback-shadow)]"
            style={{ borderRadius: "var(--feedback-radius)", boxShadow: "var(--feedback-shadow)" }} />
        </div>;
      `),
    ).toEqual([]);
  });

  test("ignores comments and JSX prose rather than treating examples as controls", () => {
    expect(
      rules(`
        // Do not use <button> or bg-violet-500 or #6d28d9.
        /* <textarea /> rounded-[13px] */
        const help = <p>Previously bg-violet-500.</p>;
      `),
    ).toEqual([]);
  });

  test("reports the source line of a violation", () => {
    expect(
      inspectWidgetDesign(widgetPath, "\n\nconst view = <button />;"),
    ).toEqual([
      {
        file: widgetPath,
        line: 3,
        rule: "widget/raw-control",
        message: "Use the installed shadcn Button primitive.",
      },
    ]);
  });

  test("allows the canonical recipe and isolated test fixtures only", () => {
    const source = '<button className="rounded-[13px] bg-[#6d28d9]" />';
    expect(rules(source, "packages/widgets/src/design-system.ts")).toEqual([]);
    expect(
      rules(source, "packages/widgets/src/feedback-widget.test.tsx"),
    ).toEqual([]);
    expect(
      rules(source, "packages/widgets/src/nested/design-system.ts"),
    ).toEqual(["widget/raw-color", "widget/raw-shape"]);
  });
});
