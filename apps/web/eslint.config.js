import { nextJsConfig } from "@workspace/eslint-config/next-js";
import { globalIgnores } from "eslint/config";

/** @type {import("eslint").Linter.Config[]} */
export default [...nextJsConfig, globalIgnores(["convex/_generated/**"])];
