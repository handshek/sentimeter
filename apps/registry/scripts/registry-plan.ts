import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { REGISTRY_URL, SITE_URL } from "../site.config";

export const REGISTRY_BASE_URL = `${REGISTRY_URL}/r`;

export type SourceMapping = Readonly<{
  source: string;
  staged: string;
  target: string;
  item:
    | "feedback-system"
    | "emoji-feedback"
    | "like-dislike"
    | "star-rating"
    | "nps"
    | "feedback-form"
    | "survey"
    | "floating-feedback"
    | "report-problem"
    | "error-feedback"
    | "was-this-helpful"
    | "after-task-rating"
    | "cancel-flow-survey";
}>;

export type PlannedArtifact = Readonly<{
  source: string;
  staged: string;
  target: string;
  item: SourceMapping["item"];
  content: string;
}>;

export const SOURCE_MAPPINGS: readonly SourceMapping[] = [
  {
    source: "feedback-system.ts",
    staged: "feedback-system/index.ts",
    target: "components/sentimeter/feedback-system/index.ts",
    item: "feedback-system",
  },
  {
    source: "types.ts",
    staged: "feedback-system/types.ts",
    target: "components/sentimeter/feedback-system/types.ts",
    item: "feedback-system",
  },
  {
    source: "design-system.ts",
    staged: "feedback-system/design-system.ts",
    target: "components/sentimeter/feedback-system/design-system.ts",
    item: "feedback-system",
  },
  {
    source: "core/errors.ts",
    staged: "feedback-system/core/errors.ts",
    target: "components/sentimeter/feedback-system/core/errors.ts",
    item: "feedback-system",
  },
  {
    source: "core/use-widget-machine.ts",
    staged: "feedback-system/core/use-widget-machine.ts",
    target: "components/sentimeter/feedback-system/core/use-widget-machine.ts",
    item: "feedback-system",
  },
  {
    source: "core/use-feedback-submission.ts",
    staged: "feedback-system/core/use-feedback-submission.ts",
    target:
      "components/sentimeter/feedback-system/core/use-feedback-submission.ts",
    item: "feedback-system",
  },
  {
    source: "core/browser-context.ts",
    staged: "feedback-system/core/browser-context.ts",
    target: "components/sentimeter/feedback-system/core/browser-context.ts",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-form-parts.tsx",
    staged: "feedback-system/compound/feedback-form-parts.tsx",
    target:
      "components/sentimeter/feedback-system/compound/feedback-form-parts.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-context.tsx",
    staged: "feedback-system/compound/feedback-context.tsx",
    target:
      "components/sentimeter/feedback-system/compound/feedback-context.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-description.tsx",
    staged: "feedback-system/compound/feedback-description.tsx",
    target:
      "components/sentimeter/feedback-system/compound/feedback-description.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-footer.tsx",
    staged: "feedback-system/compound/feedback-footer.tsx",
    target:
      "components/sentimeter/feedback-system/compound/feedback-footer.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-input.tsx",
    staged: "feedback-system/compound/feedback-input.tsx",
    target: "components/sentimeter/feedback-system/compound/feedback-input.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-rating.tsx",
    staged: "feedback-system/compound/feedback-rating.tsx",
    target:
      "components/sentimeter/feedback-system/compound/feedback-rating.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-response.tsx",
    staged: "feedback-system/compound/feedback-response.tsx",
    target:
      "components/sentimeter/feedback-system/compound/feedback-response.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-title.tsx",
    staged: "feedback-system/compound/feedback-title.tsx",
    target: "components/sentimeter/feedback-system/compound/feedback-title.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/feedback-widget.tsx",
    staged: "feedback-system/compound/feedback-widget.tsx",
    target:
      "components/sentimeter/feedback-system/compound/feedback-widget.tsx",
    item: "feedback-system",
  },
  {
    source: "compound/index.ts",
    staged: "feedback-system/compound/index.ts",
    target: "components/sentimeter/feedback-system/compound/index.ts",
    item: "feedback-system",
  },
  {
    source: "emoji-feedback.tsx",
    staged: "emoji-feedback.tsx",
    target: "components/sentimeter/emoji-feedback.tsx",
    item: "emoji-feedback",
  },
  {
    source: "like-dislike.tsx",
    staged: "like-dislike.tsx",
    target: "components/sentimeter/like-dislike.tsx",
    item: "like-dislike",
  },
  {
    source: "star-rating.tsx",
    staged: "star-rating.tsx",
    target: "components/sentimeter/star-rating.tsx",
    item: "star-rating",
  },
  {
    source: "nps-score.tsx",
    staged: "nps-score.tsx",
    target: "components/sentimeter/nps-score.tsx",
    item: "nps",
  },
  {
    source: "feedback-form.tsx",
    staged: "feedback-form.tsx",
    target: "components/sentimeter/feedback-form.tsx",
    item: "feedback-form",
  },
  {
    source: "survey.tsx",
    staged: "survey.tsx",
    target: "components/sentimeter/survey.tsx",
    item: "survey",
  },
  {
    source: "blocks/floating-feedback.tsx",
    staged: "blocks/floating-feedback.tsx",
    target: "components/sentimeter/blocks/floating-feedback.tsx",
    item: "floating-feedback",
  },
  {
    source: "blocks/report-problem.tsx",
    staged: "blocks/report-problem.tsx",
    target: "components/sentimeter/blocks/report-problem.tsx",
    item: "report-problem",
  },
  {
    source: "blocks/error-feedback.tsx",
    staged: "blocks/error-feedback.tsx",
    target: "app/error.tsx",
    item: "error-feedback",
  },
  {
    source: "blocks/was-this-helpful.tsx",
    staged: "blocks/was-this-helpful.tsx",
    target: "components/sentimeter/blocks/was-this-helpful.tsx",
    item: "was-this-helpful",
  },
  {
    source: "blocks/after-task-rating.tsx",
    staged: "blocks/after-task-rating.tsx",
    target: "components/sentimeter/blocks/after-task-rating.tsx",
    item: "after-task-rating",
  },
  {
    source: "blocks/cancel-flow-survey.tsx",
    staged: "blocks/cancel-flow-survey.tsx",
    target: "components/sentimeter/blocks/cancel-flow-survey.tsx",
    item: "cancel-flow-survey",
  },
] as const;

const IMPORT_REWRITES = new Map<string, string>([
  ["@workspace/ui/components/button", "@/components/ui/button"],
  ["@workspace/ui/components/textarea", "@/components/ui/textarea"],
  ["@workspace/ui/components/label", "@/components/ui/label"],
  ["@workspace/ui/components/popover", "@/components/ui/popover"],
  ["@workspace/ui/components/sheet", "@/components/ui/sheet"],
  ["@workspace/ui/components/dialog", "@/components/ui/dialog"],
  ["@workspace/ui/lib/utils", "@/lib/utils"],
]);

const HOST_EXTERNAL_IMPORTS = new Set(["react"]);

export class RegistryAdapterError extends Error {
  constructor(
    readonly code:
      | "artifact_conflict"
      | "bad_import"
      | "invalid_manifest"
      | "missing_source"
      | "output_drift"
      | "command_failed"
      | "relative_import_not_mapped",
    message: string,
  ) {
    super(message);
    this.name = "RegistryAdapterError";
  }
}

export function createExpectedRegistry(
  mappings: readonly SourceMapping[] = SOURCE_MAPPINGS,
) {
  validateMappings(mappings);

  const filesFor = (item: SourceMapping["item"]) =>
    mappings
      .filter((mapping) => mapping.item === item)
      .map((mapping) => ({
        path: `.generated/sentimeter/${mapping.staged}`,
        type: "registry:component" as const,
        target: mapping.target,
      }));

  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "sentimeter",
    homepage: SITE_URL,
    items: [
      {
        name: "feedback-system",
        type: "registry:block",
        title: "Feedback System",
        description:
          "Core types, submission errors, and compound components for Sentimeter widgets.",
        dependencies: ["lucide-react"],
        registryDependencies: ["button", "textarea", "label"],
        files: filesFor("feedback-system"),
      },
      {
        name: "emoji-feedback",
        type: "registry:block",
        title: "Emoji Feedback",
        description: "Emoji-based feedback widget with a 5-point scale.",
        registryDependencies: [`${REGISTRY_BASE_URL}/feedback-system.json`],
        files: filesFor("emoji-feedback"),
      },
      {
        name: "like-dislike",
        type: "registry:block",
        title: "Like Dislike",
        description: "Thumbs up or thumbs down feedback widget.",
        registryDependencies: [`${REGISTRY_BASE_URL}/feedback-system.json`],
        files: filesFor("like-dislike"),
      },
      {
        name: "star-rating",
        type: "registry:block",
        title: "Star Rating",
        description: "Five-star rating feedback widget.",
        registryDependencies: [`${REGISTRY_BASE_URL}/feedback-system.json`],
        files: filesFor("star-rating"),
      },
      {
        name: "nps",
        type: "registry:block",
        title: "NPS",
        description: "A 0–10 recommendation scale with optional follow-up.",
        registryDependencies: [`${REGISTRY_BASE_URL}/feedback-system.json`],
        files: filesFor("nps"),
      },
      {
        name: "feedback-form",
        type: "registry:block",
        title: "Feedback Form",
        description: "Free-text feedback with page and browser context.",
        registryDependencies: [`${REGISTRY_BASE_URL}/feedback-system.json`],
        files: filesFor("feedback-form"),
      },
      {
        name: "survey",
        type: "registry:block",
        title: "Survey",
        description: "Single-choice reasons with an optional follow-up note.",
        registryDependencies: [`${REGISTRY_BASE_URL}/feedback-system.json`],
        files: filesFor("survey"),
      },
      {
        name: "floating-feedback",
        type: "registry:block",
        title: "Floating feedback button",
        description:
          "A floating Feedback pill with a desktop popover and mobile bottom sheet.",
        dependencies: ["lucide-react"],
        registryDependencies: [
          `${REGISTRY_BASE_URL}/feedback-form.json`,
          "button",
          "popover",
          "sheet",
        ],
        files: filesFor("floating-feedback"),
      },
      {
        name: "report-problem",
        type: "registry:block",
        title: "Report a problem",
        description: "A header button that opens a feedback form in a dialog.",
        dependencies: ["lucide-react"],
        registryDependencies: [
          `${REGISTRY_BASE_URL}/feedback-form.json`,
          "button",
          "dialog",
        ],
        files: filesFor("report-problem"),
      },
      {
        name: "error-feedback",
        type: "registry:block",
        title: "Error page",
        description:
          "A Next.js error boundary with inline feedback and a retry action.",
        dependencies: ["lucide-react"],
        registryDependencies: [
          `${REGISTRY_BASE_URL}/feedback-form.json`,
          "button",
        ],
        files: filesFor("error-feedback"),
      },
      {
        name: "was-this-helpful",
        type: "registry:block",
        title: "Was this helpful?",
        description:
          "Inline thumbs feedback below docs, help articles, or AI answers.",
        registryDependencies: [`${REGISTRY_BASE_URL}/like-dislike.json`],
        files: filesFor("was-this-helpful"),
      },
      {
        name: "after-task-rating",
        type: "registry:block",
        title: "After-task rating",
        description: "A checkout success message followed by an emoji rating.",
        dependencies: ["lucide-react"],
        registryDependencies: [`${REGISTRY_BASE_URL}/emoji-feedback.json`],
        files: filesFor("after-task-rating"),
      },
      {
        name: "cancel-flow-survey",
        type: "registry:block",
        title: "Cancel-flow survey",
        description:
          "A cancellation dialog with reasons and a host-owned cancel action.",
        registryDependencies: [
          `${REGISTRY_BASE_URL}/survey.json`,
          "button",
          "dialog",
        ],
        files: filesFor("cancel-flow-survey"),
      },
    ],
  } as const;
}

export async function planRegistryArtifacts(options: {
  sourceRoot: string;
  mappings?: readonly SourceMapping[];
}): Promise<readonly PlannedArtifact[]> {
  const mappings = options.mappings ?? SOURCE_MAPPINGS;
  validateMappings(mappings);
  const mappedSources = new Set(mappings.map((mapping) => mapping.source));
  const targetBySource = new Map(
    mappings.map((mapping) => [mapping.source, mapping.target]),
  );
  const mappedTargets = new Set(mappings.map((mapping) => mapping.target));
  const declaredDependencies = getDeclaredDependencies(mappings);

  const artifacts = await Promise.all(
    mappings.map(async (mapping) => {
      const sourcePath = path.join(options.sourceRoot, mapping.source);
      let content: string;
      try {
        content = await readFile(sourcePath, "utf8");
      } catch (error) {
        if (isMissingFileError(error)) {
          throw new RegistryAdapterError(
            "missing_source",
            `Canonical Widget source is missing: ${mapping.source}`,
          );
        }
        throw error;
      }

      return {
        ...mapping,
        content: validateAndRewriteImports({
          content,
          source: mapping.source,
          mappedSources,
          target: mapping.target,
          targetBySource,
          mappedTargets,
          declaredDependencies:
            declaredDependencies.get(mapping.item) ?? HOST_EXTERNAL_IMPORTS,
        }),
      };
    }),
  );

  validateStagedImports(artifacts);
  return artifacts;
}

export function validateManifest(
  actual: unknown,
  mappings: readonly SourceMapping[] = SOURCE_MAPPINGS,
): void {
  const expected = createExpectedRegistry(mappings);
  if (stableJson(actual) !== stableJson(expected)) {
    throw new RegistryAdapterError(
      "invalid_manifest",
      "apps/registry/registry.json does not match the explicit Registry Item map.",
    );
  }
}

function validateMappings(mappings: readonly SourceMapping[]): void {
  const seenSources = new Set<string>();
  const seenStaged = new Set<string>();
  const seenTargets = new Set<string>();

  for (const mapping of mappings) {
    validateRelativePath(mapping.source, "source");
    validateRelativePath(mapping.staged, "staged output");
    validateRelativePath(mapping.target, "host target");

    if (seenSources.has(mapping.source)) {
      throw new RegistryAdapterError(
        "artifact_conflict",
        `Duplicate canonical source mapping: ${mapping.source}`,
      );
    }
    if (seenStaged.has(mapping.staged)) {
      throw new RegistryAdapterError(
        "artifact_conflict",
        `Duplicate staged output mapping: ${mapping.staged}`,
      );
    }
    if (seenTargets.has(mapping.target)) {
      throw new RegistryAdapterError(
        "artifact_conflict",
        `Duplicate host target mapping: ${mapping.target}`,
      );
    }

    seenSources.add(mapping.source);
    seenStaged.add(mapping.staged);
    seenTargets.add(mapping.target);
  }
}

function validateRelativePath(value: string, label: string): void {
  const normalized = path.posix.normalize(value);
  if (
    path.posix.isAbsolute(value) ||
    normalized === ".." ||
    normalized.startsWith("../") ||
    normalized !== value
  ) {
    throw new RegistryAdapterError(
      "artifact_conflict",
      `Invalid ${label} path: ${value}`,
    );
  }
}

function validateAndRewriteImports(options: {
  content: string;
  source: string;
  mappedSources: ReadonlySet<string>;
  target: string;
  targetBySource: ReadonlyMap<string, string>;
  mappedTargets: ReadonlySet<string>;
  declaredDependencies: ReadonlySet<string>;
}): string {
  const sourceFile = ts.createSourceFile(
    options.source,
    options.content,
    ts.ScriptTarget.Latest,
    true,
    options.source.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const replacements: Array<{ start: number; end: number; value: string }> = [];

  rejectUnsupportedModuleLoads(sourceFile, options.source);

  for (const statement of sourceFile.statements) {
    const moduleSpecifier = getModuleSpecifier(statement);
    if (!moduleSpecifier) continue;

    const specifier = moduleSpecifier.text;
    const replacement = IMPORT_REWRITES.get(specifier);
    if (replacement) {
      replacements.push({
        start: moduleSpecifier.getStart(sourceFile) + 1,
        end: moduleSpecifier.getEnd() - 1,
        value: replacement,
      });
      continue;
    }

    if (specifier.startsWith(".")) {
      const importedSource = resolveMappedRelativeImport(
        options.source,
        specifier,
        options.mappedSources,
      );
      if (!importedSource) {
        throw new RegistryAdapterError(
          "relative_import_not_mapped",
          `${options.source} imports ${specifier}, which is outside the explicit Registry Item map.`,
        );
      }
      const importedTarget = options.targetBySource.get(importedSource);
      if (
        importedTarget &&
        resolveMappedRelativeImport(
          options.target,
          specifier,
          options.mappedTargets,
        ) !== importedTarget
      ) {
        replacements.push({
          start: moduleSpecifier.getStart(sourceFile) + 1,
          end: moduleSpecifier.getEnd() - 1,
          value: `@/${importedTarget.replace(/\.tsx?$/, "").replace(/\/index$/, "")}`,
        });
      }
      continue;
    }

    if (!options.declaredDependencies.has(packageName(specifier))) {
      throw new RegistryAdapterError(
        "bad_import",
        `${options.source} imports undeclared dependency ${specifier}.`,
      );
    }
  }

  let output = options.content;
  for (const replacement of replacements.sort((a, b) => b.start - a.start)) {
    output = `${output.slice(0, replacement.start)}${replacement.value}${output.slice(replacement.end)}`;
  }

  if (output.includes("@workspace/")) {
    throw new RegistryAdapterError(
      "bad_import",
      `${options.source} leaves a forbidden workspace import in generated output.`,
    );
  }

  return output;
}

function getDeclaredDependencies(
  mappings: readonly SourceMapping[],
): ReadonlyMap<SourceMapping["item"], ReadonlySet<string>> {
  const registry = createExpectedRegistry(mappings);
  return new Map(
    registry.items.map((item) => [
      item.name,
      new Set([
        ...("dependencies" in item ? item.dependencies : []),
        ...HOST_EXTERNAL_IMPORTS,
      ]),
    ]),
  );
}

function packageName(specifier: string): string {
  if (!specifier.startsWith("@")) return specifier.split("/")[0] ?? specifier;
  return specifier.split("/").slice(0, 2).join("/");
}

function rejectUnsupportedModuleLoads(
  sourceFile: ts.SourceFile,
  source: string,
): void {
  const visit = (node: ts.Node): void => {
    if (ts.isImportEqualsDeclaration(node)) {
      throw new RegistryAdapterError(
        "bad_import",
        `${source} uses unsupported import-equals syntax.`,
      );
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    ) {
      throw new RegistryAdapterError(
        "bad_import",
        `${source} uses an unsupported dynamic module load.`,
      );
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
}

function validateStagedImports(artifacts: readonly PlannedArtifact[]): void {
  const stagedFiles = new Set(artifacts.map((artifact) => artifact.staged));

  for (const artifact of artifacts) {
    const sourceFile = ts.createSourceFile(
      artifact.staged,
      artifact.content,
      ts.ScriptTarget.Latest,
      true,
      artifact.staged.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    for (const statement of sourceFile.statements) {
      const moduleSpecifier = getModuleSpecifier(statement);
      if (!moduleSpecifier?.text.startsWith(".")) continue;
      if (
        !resolveMappedRelativeImport(
          artifact.staged,
          moduleSpecifier.text,
          stagedFiles,
        )
      ) {
        throw new RegistryAdapterError(
          "relative_import_not_mapped",
          `${artifact.staged} imports ${moduleSpecifier.text}, which is unresolved in staged output.`,
        );
      }
    }
  }
}

function getModuleSpecifier(
  statement: ts.Statement,
): ts.StringLiteral | undefined {
  if (
    ts.isImportDeclaration(statement) &&
    ts.isStringLiteral(statement.moduleSpecifier)
  ) {
    return statement.moduleSpecifier;
  }
  if (
    ts.isExportDeclaration(statement) &&
    statement.moduleSpecifier &&
    ts.isStringLiteral(statement.moduleSpecifier)
  ) {
    return statement.moduleSpecifier;
  }
  return undefined;
}

function resolveMappedRelativeImport(
  source: string,
  specifier: string,
  mappedSources: ReadonlySet<string>,
): string | undefined {
  const base = path.posix.normalize(
    path.posix.join(path.posix.dirname(source), specifier),
  );
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ];
  return candidates.find((candidate) => mappedSources.has(candidate));
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
