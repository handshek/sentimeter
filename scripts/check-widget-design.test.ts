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

  test.each([
    "transition-all",
    "hover:transition-all",
    "transition-[height,opacity]",
    "transition-[transform,width]",
    "transition-[max-height]",
    "zoom-in-95",
    "starting:translate-y-2",
    "starting:scale-95 motion-reduce:opacity-100",
    "starting:translate-x-2 motion-reduce:translate-y-0",
    "starting:translate-x-2 starting:scale-95 motion-reduce:transform-none",
    "starting:translate-y-2 motion-reduce:hover:translate-y-0",
    "starting:translate-y-2 motion-reduce:translate-none",
    "starting:translate-y-2 motion-reduce:translate-y-0",
  ])(
    "rejects unsafe motion in host source and canonical recipes: %s",
    (classes) => {
      const source = `<Card className="${classes}" />`;
      expect(rules(source)).toEqual(["widget/motion"]);
      expect(rules(source, "packages/widgets/src/design-system.ts")).toEqual([
        "widget/motion",
      ]);
    },
  );

  test("rejects the zoom style property", () => {
    expect(rules("<Card style={{ zoom: 1.1 }} />")).toEqual(["widget/motion"]);
  });

  test.each([
    "transition-[transform,opacity,clip-path]",
    "starting:translate-y-2 motion-reduce:starting:translate-y-0",
    "starting:scale-95 starting:motion-reduce:scale-100",
    "starting:translate-x-2 starting:scale-95 motion-reduce:starting:translate-none motion-reduce:starting:scale-none",
  ])("accepts reduced entrances and explicit transitions: %s", (classes) => {
    expect(rules(`<Card className="${classes}" />`)).toEqual([]);
  });

  test("accepts reduced entrances composed through cn and template spans", () => {
    expect(
      rules(
        '<Card className={cn("starting:translate-y-2", "motion-reduce:starting:translate-y-0")} />',
      ),
    ).toEqual([]);
    expect(
      rules(
        "const classes = `starting:scale-95 ${extra} motion-reduce:starting:scale-100`;",
      ),
    ).toEqual([]);
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
