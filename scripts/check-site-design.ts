import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export const siteDesignRoots = [
  "apps/web/app/design-system",
  "apps/web/app/_components/landing",
  "apps/web/app/components/_components",
] as const;

type SiteDesignRule =
  | "site/raw-color"
  | "site/palette-color"
  | "site/font-family"
  | "site/raw-type"
  | "site/control-size";

export type SiteDesignFinding = {
  file: string;
  line: number;
  rule: SiteDesignRule;
  message: string;
};

const rawColor =
  /#[\da-f]{8}\b|#[\da-f]{6}\b|#[\da-f]{4}\b|#[\da-f]{3}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/i;
const paletteColor =
  /(?:^|[\s:!])(?:bg|text|border(?:-[trblxyse])?|divide|ring(?:-offset)?|outline|fill|stroke|accent|caret|decoration|placeholder|from|via|to|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)(?=$|[\s/!])/;
const solidColor =
  /(?:^|[\s:!])(?:bg|text|border(?:-[trblxyse])?|divide|ring(?:-offset)?|outline|fill|stroke|accent|caret|decoration|placeholder|from|via|to)-(?:black|white)(?=$|[\s/!])/;
const arbitraryType = /(?:^|[\s:!])text-\[((?:length:)?[^\]]+)\]/g;
const arbitraryFamily = /(?:^|[\s:!])font-\[([^\]]+)\]/g;
// Sized primitives own their heights (40 px with a 44 px hit area). A local
// height override is how `data-[size=default]:h-9` once beat `h-11`.
const sizedPrimitives = new Set([
  "Button",
  "Input",
  "SelectTrigger",
  "TabsList",
  "TabsTrigger",
]);
const controlHeight = /^!?(?:h|min-h|size)-(?:\d|\[|\()/;

// The utility after every variant prefix, ignoring colons inside brackets.
function finalUtility(token: string) {
  let depth = 0;
  let start = 0;
  for (let index = 0; index < token.length; index++) {
    const char = token[index];
    if (char === "[" || char === "(") depth++;
    else if (char === "]" || char === ")") depth--;
    else if (char === ":" && depth === 0) start = index + 1;
  }
  return token.slice(start).replace(/!$/, "");
}

function hasControlHeight(value: string) {
  return value
    .split(/\s+/)
    .some((token) => token && controlHeight.test(finalUtility(token)));
}
const sizeValue = /(?:\d|\.)(?:[\d.]*)(?:px|rem|em|vw|vh|cqw|cqh|%)\b/;

function isSemantic(value: string) {
  return /^(?:[a-z-]+:)?(?:var\(--[\w-]+\)|--[\w-]+)$/.test(value);
}

function isScoped(file: string) {
  return (
    siteDesignRoots.some((root) => file.startsWith(`${root}/`)) &&
    !/(?:^|\/)__tests__\/|[._](?:test|spec)\.[cm]?[jt]sx?$|(?:^|\/)test-setup\.[jt]s$/.test(
      file,
    )
  );
}

function isPresentationLiteral(node: ts.Node, parsed: ts.SourceFile) {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isJsxAttribute(current))
      return ["className", "style"].includes(current.name.getText(parsed));
    if (ts.isPropertyAssignment(current)) {
      const name = current.name.getText(parsed).replaceAll(/["']/g, "");
      if (
        [
          "className",
          "style",
          "color",
          "background",
          "backgroundColor",
          "borderColor",
          "fill",
          "stroke",
        ].includes(name)
      )
        return true;
    }
    if (
      ts.isCallExpression(current) &&
      ["cn", "clsx", "cva"].includes(current.expression.getText(parsed))
    )
      return true;
    if (ts.isVariableDeclaration(current))
      return /^(?:classes|className|.*Classes|.*ClassName)$/.test(
        current.name.getText(parsed),
      );
    if (ts.isSourceFile(current)) break;
  }
  return false;
}

export function inspectSiteDesign(
  file: string,
  source: string,
): SiteDesignFinding[] {
  const normalized = file.replaceAll("\\", "/");
  if (!isScoped(normalized)) return [];
  const parsed = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const findings: SiteDesignFinding[] = [];

  function report(node: ts.Node, rule: SiteDesignRule, message: string) {
    findings.push({
      file: normalized,
      line:
        parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1,
      rule,
      message,
    });
  }

  function inspectLiteral(node: ts.Node, value: string) {
    if (rawColor.test(value))
      report(
        node,
        "site/raw-color",
        "Use semantic theme colors; palette values belong in globals.css.",
      );
    if (paletteColor.test(value) || solidColor.test(value))
      report(
        node,
        "site/palette-color",
        "Use a semantic role such as background, foreground, primary, or success.",
      );
    if (
      [...value.matchAll(arbitraryType)].some(
        (match) =>
          !isSemantic(match[1] ?? "") && sizeValue.test(match[1] ?? ""),
      )
    ) {
      report(
        node,
        "site/raw-type",
        "Use a ds-* type role or a semantic type variable from foundations.css.",
      );
    }
    if (
      [...value.matchAll(arbitraryFamily)].some(
        (match) => !isSemantic(match[1] ?? "") && !/^\d+$/.test(match[1] ?? ""),
      )
    ) {
      report(
        node,
        "site/font-family",
        "Use the loaded font variables or the shared font-sans/font-mono roles.",
      );
    }
  }

  function inspectControl(
    node: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  ) {
    if (!sizedPrimitives.has(node.tagName.getText(parsed))) return;
    for (const attribute of node.attributes.properties) {
      if (
        !ts.isJsxAttribute(attribute) ||
        attribute.name.getText(parsed) !== "className" ||
        !attribute.initializer
      )
        continue;
      const literals: string[] = [];
      const collect = (child: ts.Node) => {
        if (ts.isStringLiteralLike(child) || ts.isTemplateLiteralToken(child))
          literals.push(child.text);
        ts.forEachChild(child, collect);
      };
      collect(attribute.initializer);
      if (literals.some(hasControlHeight))
        report(
          attribute,
          "site/control-size",
          "Use the primitive's size prop; it already provides the 44 px hit area.",
        );
    }
  }

  function visit(node: ts.Node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      inspectControl(node);
    if (ts.isStringLiteralLike(node) || ts.isTemplateLiteralToken(node)) {
      if (isPresentationLiteral(node, parsed)) inspectLiteral(node, node.text);
    }
    if (ts.isPropertyAssignment(node)) {
      const name = node.name.getText(parsed).replaceAll(/["']/g, "");
      const value = node.initializer;
      if (
        (name === "fontFamily" || name === "fontSize") &&
        (ts.isNumericLiteral(value) ||
          (ts.isStringLiteralLike(value) &&
            !isSemantic(value.text) &&
            value.text !== "inherit"))
      ) {
        report(
          node,
          name === "fontFamily" ? "site/font-family" : "site/raw-type",
          "Use the shared type role or a loaded semantic font/type variable.",
        );
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  return findings;
}

export function checkSiteDesign(repoRoot: string): SiteDesignFinding[] {
  const findings: SiteDesignFinding[] = [];
  function walk(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.[cm]?[jt]sx?$/.test(entry.name))
        findings.push(
          ...inspectSiteDesign(
            relative(repoRoot, path),
            readFileSync(path, "utf8"),
          ),
        );
    }
  }
  for (const root of siteDesignRoots) walk(join(repoRoot, root));
  return findings;
}

if (import.meta.main) {
  const findings = checkSiteDesign(
    resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  );
  for (const finding of findings)
    console.error(
      `${finding.file}:${finding.line} ${finding.rule}: ${finding.message}`,
    );
  if (findings.length) {
    console.error(
      `Site design check failed with ${findings.length} finding(s).`,
    );
    process.exitCode = 1;
  } else console.log("Site design rules pass.");
}
