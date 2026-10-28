import { config as reactInternalConfig } from "@workspace/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternalConfig,
  {
    // Vendored shadcn primitives: keep them identical to upstream.
    files: ["src/components/**"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
];
