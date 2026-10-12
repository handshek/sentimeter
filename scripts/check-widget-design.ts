import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

type DesignRule =
  | "widget/raw-color"
  | "widget/palette-color"
  | "widget/raw-control"
  | "widget/raw-shape";

export type WidgetDesignFinding = {
  file: string;
  line: number;
  rule: DesignRule;
  message: string;
};

const rawColor =
  /#[\da-f]{8}\b|#[\da-f]{6}\b|#[\da-f]{4}\b|#[\da-f]{3}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/i;
const paletteColor =
  /(?:^|[\s:!])(?:bg|text|border(?:-[trblxyse])?|divide|ring(?:-offset)?|outline|fill|stroke|accent|caret|decoration|placeholder|from|via|to|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)(?=$|[\s/!])/;
const solidColor =
  /(?:^|[\s:!])(?:bg|text|border(?:-[trblxyse])?|divide|ring(?:-offset)?|outline|fill|stroke|accent|caret|decoration|placeholder|from|via|to)-(?:black|white)(?=$|[\s/!])/;
const arbitraryShape =
  /(?:^|[\s:!])(?:rounded(?:-[trblse]{1,2})?|(?:inset-)?shadow)-\[([^\]]+)\]/g;
const primitiveControls: Record<string, string> = {
  button: "Button",
  textarea: "Textarea",
  input: "Input",
  label: "Label",
};

function usesSemanticVariable(value: string) {
  return /^(?:[a-z-]+:)?(?:var\(--[\w-]+\)|--[\w-]+)$/.test(value);
}

function isTestFile(file: string) {
  return /(?:^|\/)__tests__\/|[._](?:test|spec)\.[cm]?[jt]sx?$|(?:^|\/)test-setup\.[jt]s$/.test(
    file,
  );
}

export function inspectWidgetDesign(
  file: string,
  source: string,
): WidgetDesignFinding[] {
  const normalizedFile = file.replaceAll("\\", "/");
  if (
    normalizedFile === "packages/widgets/src/design-system.ts" ||
    isTestFile(normalizedFile)
  ) {
    return [];
  }

  const parsed = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings: WidgetDesignFinding[] = [];

  function report(node: ts.Node, rule: DesignRule, message: string) {
    findings.push({
      file: normalizedFile,
      line:
        parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1,
      rule,
      message,
    });
  }

  function inspectLiteral(node: ts.Node, value: string) {
    if (rawColor.test(value)) {
      report(
        node,
        "widget/raw-color",
        "Use a semantic feedback style; define palette values in design-system.ts.",
      );
    }
    if (paletteColor.test(value) || solidColor.test(value)) {
      report(
        node,
        "widget/palette-color",
        "Use a host or feedback semantic color instead of a Tailwind palette color.",
      );
    }
    if (
      [...value.matchAll(arbitraryShape)].some(
        (match) => !usesSemanticVariable(match[1] ?? ""),
      )
    ) {
      report(
        node,
        "widget/raw-shape",
        "Use feedbackStyles or a semantic variable; define radius and shadow values in design-system.ts.",
      );
    }
  }

  function visit(node: ts.Node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(parsed);
      const primitive = Object.hasOwn(primitiveControls, tag)
        ? primitiveControls[tag]
        : undefined;
      if (primitive) {
        report(
          node,
          "widget/raw-control",
          `Use the installed shadcn ${primitive} primitive.`,
        );
      }
    }

    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
      inspectLiteral(node, node.text);
    }

    if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(parsed).replaceAll(/["']/g, "");
      if (name === "borderRadius" || name === "boxShadow") {
        const value = node.initializer;
        if (
          ts.isNumericLiteral(value) ||
          (ts.isStringLiteralLike(value) &&
            !usesSemanticVariable(value.text) &&
            value.text !== "none" &&
            value.text !== "inherit")
        ) {
          report(
            node,
            "widget/raw-shape",
            "Use a semantic radius or shadow variable from design-system.ts.",
          );
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(parsed);
  return findings;
}

export function checkWidgetDesign(repoRoot: string): WidgetDesignFinding[] {
  const sourceRoot = join(repoRoot, "packages/widgets/src");
  const findings: WidgetDesignFinding[] = [];

  function walk(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(path);
      } else if (/\.[cm]?[jt]sx?$/.test(entry.name)) {
        findings.push(
          ...inspectWidgetDesign(
            relative(repoRoot, path),
            readFileSync(path, "utf8"),
          ),
        );
      }
    }
  }

  walk(sourceRoot);
  return findings;
}

if (import.meta.main) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const findings = checkWidgetDesign(repoRoot);

  for (const finding of findings) {
    console.error(
      `${finding.file}:${finding.line} ${finding.rule}: ${finding.message}`,
    );
  }

  if (findings.length > 0) {
    console.error(
      `Widget design check failed with ${findings.length} finding(s).`,
    );
    process.exitCode = 1;
  } else {
    console.log("Widget design rules pass.");
  }
}
