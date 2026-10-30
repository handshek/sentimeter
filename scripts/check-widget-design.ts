import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  listRepoFiles,
  rawColor,
  paletteColor,
  solidColor,
} from "./guard-utils";

type DesignRule =
  | "widget/raw-color"
  | "widget/palette-color"
  | "widget/raw-control"
  | "widget/raw-shape"
  | "widget/motion";

export type WidgetDesignFinding = {
  file: string;
  line: number;
  rule: DesignRule;
  message: string;
};

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
  if (isTestFile(normalizedFile)) {
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

  const recipe = normalizedFile === "packages/widgets/src/design-system.ts";

  function inspectMotion(node: ts.Node, value: string) {
    const tokens = value.split(/\s+/);
    const layoutTransition = tokens.some(
      (token) =>
        /(?:^|:)transition-all!?$/.test(token) ||
        [...token.matchAll(/transition-\[([^\]]+)\]/g)].some((match) =>
          /(?:^|[,_])(?:min-|max-)?(?:height|width)(?:$|[,_])/.test(
            match[1] ?? "",
          ),
        ),
    );
    const zoom = tokens.some((token) =>
      /(?:^|:)(?:zoom(?:-|$)|\[zoom:)/.test(token),
    );
    function parts(token: string) {
      const segments: string[] = [];
      let depth = 0;
      let start = 0;
      for (let index = 0; index < token.length; index++) {
        const char = token[index];
        if (char === "[" || char === "(") depth++;
        else if (char === "]" || char === ")") depth--;
        else if (char === ":" && depth === 0) {
          segments.push(token.slice(start, index));
          start = index + 1;
        }
      }
      return {
        variants: segments,
        utility: token.slice(start).replace(/^!|!$/g, ""),
      };
    }
    const classes = tokens.map(parts);
    const unreducedEntrance = classes.some(({ variants, utility }) => {
      if (!variants.includes("starting") || variants.includes("motion-reduce"))
        return false;
      const property = utility.match(
        /^-?(translate(?:-[xyz])?|scale(?:-[xyz])?)-/,
      )?.[1];
      if (!property) return false;
      const family = property.startsWith("scale") ? "scale" : "translate";
      return !classes.some(
        (counterpart) =>
          counterpart.variants.includes("motion-reduce") &&
          counterpart.variants.includes("starting") &&
          counterpart.variants.every(
            (variant) =>
              variant === "motion-reduce" || variants.includes(variant),
          ) &&
          (counterpart.utility === `${family}-none` ||
            counterpart.utility ===
              `${property}-${family === "scale" ? "100" : "0"}`),
      );
    });
    if (layoutTransition || zoom || unreducedEntrance)
      report(
        node,
        "widget/motion",
        "Avoid layout transitions and zoom; starting transforms need a motion-reduce counterpart.",
      );
  }

  const motionScopes = new Set<ts.Node>();

  function inspectLiteral(node: ts.Node, value: string) {
    let scope = node;
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (
        ts.isJsxAttribute(parent) ||
        ts.isPropertyAssignment(parent) ||
        ts.isVariableDeclaration(parent)
      ) {
        scope = parent;
        break;
      }
      if (ts.isSourceFile(parent)) break;
    }
    if (!motionScopes.has(scope)) {
      motionScopes.add(scope);
      const values: string[] = [];
      const collect = (child: ts.Node) => {
        if (ts.isStringLiteralLike(child) || ts.isTemplateLiteralToken(child))
          values.push(child.text);
        ts.forEachChild(child, collect);
      };
      collect(scope);
      inspectMotion(node, values.join(" "));
    }
    if (recipe) return;
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
      if (primitive && !recipe) {
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
      if (name === "zoom") {
        report(node, "widget/motion", "Avoid zoom in installed widgets.");
      }
      if (!recipe && (name === "borderRadius" || name === "boxShadow")) {
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
  return listRepoFiles(repoRoot, ["packages/widgets/src"])
    .filter((file) => /\.[cm]?[jt]sx?$/.test(file))
    .flatMap((file) =>
      inspectWidgetDesign(file, readFileSync(join(repoRoot, file), "utf8")),
    );
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
