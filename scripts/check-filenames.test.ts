import { describe, expect, test } from "bun:test";
import { inspectFilename } from "./check-filenames";

describe("module filename guard", () => {
  test.each([
    "packages/widgets/src/FeedbackWidget.tsx",
    "apps/web/lib/widget_catalog.ts",
    "apps/web/lib/widget-catalog.spec.ts",
    "apps/web/lib/widget-catalog_test.ts",
    "apps/web/lib/widget-catalog-test.ts",
    "apps/web/lib/widget-catalog.test.js",
    "apps/web/lib/widget-catalog.helper.ts",
  ])("rejects an invalid module or test name: %s", (file) => {
    expect(inspectFilename(file)).toEqual({
      file,
      rule: "filename/convention",
      message: "Use kebab-case module names and *.test.ts(x) tests.",
    });
  });

  test("rejects kebab-case Convex modules", () => {
    expect(inspectFilename("apps/web/convex/http-actions.ts")).toEqual({
      file: "apps/web/convex/http-actions.ts",
      rule: "filename/convention",
      message: "Use camelCase module names and *.test.ts(x) tests.",
    });
  });

  test.each([
    "packages/widgets/src/feedback-widget.tsx",
    "packages/widgets/src/feedback-widget.test.tsx",
    "apps/web/lib/hosted-config.test.ts",
    "apps/web/test-setup.ts",
    "apps/web/next.config.js",
    "apps/registry/eslint.config.mjs",
    "apps/web/types.d.ts",
    "apps/web/convex/httpActions.ts",
    "apps/web/convex/lib/feedbackDomain.test.ts",
    "apps/web/convex/auth.config.ts",
    "apps/web/app/global-error.tsx",
    "apps/web/app/(site)/components/[slug]/page.tsx",
    "apps/web/app/(hosted)/sign-in/[[...sign-in]]/page.tsx",
    "apps/web/app/[projectId].tsx",
    "apps/web/app/[...slug].tsx",
    "apps/web/app/[[...slug]].tsx",
    "apps/web/convex/_generated/dataModel.d.ts",
    "apps/registry/.generated/FeedbackWidget.tsx",
    "apps/registry/worker-configuration.d.ts",
    "apps/web/assets/fonts/GeistVF.woff",
    "AGENTS.md",
  ])("accepts module conventions and generated files: %s", (file) => {
    expect(inspectFilename(file)).toBeUndefined();
  });

  test("normalizes Windows paths before checking Convex conventions", () => {
    expect(inspectFilename("apps\\web\\convex\\http-actions.ts")?.file).toBe(
      "apps/web/convex/http-actions.ts",
    );
  });
});
