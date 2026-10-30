import { describe, expect, test } from "bun:test";
import { inspectSiteDesign } from "./check-site-design";

const path = "apps/web/components/landing/example.tsx";
const rules = (source: string, file = path) =>
  inspectSiteDesign(file, source).map((finding) => finding.rule);

describe("site design guard", () => {
  test.each([
    '<section className="bg-[#fff]" />',
    '<div style={{ color: "oklch(0.7 0.1 220)" }} />',
    '<div style={{ backgroundColor: "#11223344" }} />',
  ])("rejects literal palettes: %s", (source) =>
    expect(rules(source)).toEqual(["site/raw-color"]),
  );

  test.each([
    '<section className="dark:bg-violet-950/60" />',
    '<p className="text-blue-600" />',
    '<div className="bg-white" />',
    'const classes = `p-6 ${active ? "text-red-500" : "text-foreground"}`;',
  ])("rejects uncoordinated palette utilities: %s", (source) =>
    expect(rules(source)).toEqual(["site/palette-color"]),
  );

  test.each([
    '<h1 className="md:text-[52px]" />',
    '<p className="text-[1.0625rem]" />',
    '<h2 className="text-[clamp(1rem,3vw,3rem)]" />',
    "<p style={{ fontSize: 17 }} />",
    '<p style={{ fontSize: "1.1rem" }} />',
  ])("rejects arbitrary type sizes: %s", (source) =>
    expect(rules(source)).toEqual(["site/raw-type"]),
  );

  test.each([
    '<p className="font-[Georgia]" />',
    '<h2 className="font-[family-name:Arial]" />',
    '<p style={{ fontFamily: "Inter, sans-serif" }} />',
  ])("rejects untracked font choices: %s", (source) =>
    expect(rules(source)).toEqual(["site/font-family"]),
  );

  test.each([
    '<Button className="h-11 px-5" />',
    '<SelectTrigger className="w-full data-[size=default]:h-11" />',
    '<TabsTrigger className="min-h-11" />',
    '<Button className="size-11" size="icon" />',
    '<Input className={cn("sm:h-12", className)} />',
    '<TabsList className="@md:min-h-12" />',
    '<SelectTrigger className="data-[orientation=horizontal]:h-(--row)" />',
    '<Button className="hover:!size-11" />',
  ])("rejects height overrides on sized primitives: %s", (source) =>
    expect(rules(source)).toEqual(["site/control-size"]),
  );

  test("accepts primitive sizes and heights on ordinary elements", () => {
    expect(
      rules(`
      <Button size="lg" className="w-full justify-start px-3" />;
      <Button className="h-auto whitespace-normal" />;
      <Link className="inline-flex min-h-11 items-center" href="/" />;
      <AccordionTrigger className="min-h-11" />;
      <div className="h-12" />;
    `),
    ).toEqual([]);
  });

  test("accepts semantic composition, font specimens, and ordinary layout", () => {
    expect(
      rules(`
      const specimen = <section className="ds-container grid gap-8 lg:grid-cols-[208px_1fr]">
        <h1 className="ds-display text-foreground">Listen well.</h1>
        <p className="font-mono text-sm text-muted-foreground">Identifier</p>
        <h2 className="font-[family-name:var(--font-lora)] text-[length:var(--ds-type-title)]" />
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "var(--ds-type-body)" }} />
        <div className="bg-success-subtle text-success" />
        <Link href="#abc">Anchor</Link>
      </section>;
    `),
    ).toEqual([]);
  });

  test("ignores prose and comments", () => {
    expect(
      rules(`
      // Avoid text-[52px] and bg-red-500.
      const note = <p>Old value: #fff.</p>;
      const explanatoryData = { description: "The old value was #fff.", snippet: '<p className="text-[17px]" />' };
      const codeExample = 'const oldColor = "#fff";';
      <CodeBlock code={codeExample} />;
    `),
    ).toEqual([]);
  });

  test("covers public routes and leaves hosted routes out of scope", () => {
    const source = '<p className="text-[17px]" />';
    expect(rules(source, "apps/web/app/(site)/privacy/page.tsx")).toEqual([
      "site/raw-type",
    ]);
    expect(
      rules(
        source,
        "apps/web/app/(site)/design-system/_components/example.tsx",
      ),
    ).toEqual(["site/raw-type"]);
    expect(rules(source, "apps/web/components/docs/example.tsx")).toEqual([
      "site/raw-type",
    ]);
    expect(rules(source, "apps/web/app/(hosted)/dashboard/page.tsx")).toEqual(
      [],
    );
    expect(
      rules(source, "apps/web/app/(site)/design-system/example.test.tsx"),
    ).toEqual([]);
  });

  test("reports the changed source line", () => {
    const finding = inspectSiteDesign(
      path,
      "\n\nconst view = <p style={{ fontSize: 19 }} />;",
    )[0];
    expect(finding?.file).toBe(path);
    expect(finding?.line).toBe(3);
    expect(finding?.rule).toBe("site/raw-type");
  });
});
