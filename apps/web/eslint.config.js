import { nextJsConfig } from "@workspace/eslint-config/next-js";
import { globalIgnores } from "eslint/config";

import { typedPromises } from "@workspace/eslint-config/typed";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  typedPromises,
  globalIgnores(["convex/_generated/**"]),
];
