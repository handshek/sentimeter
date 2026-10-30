import { nextJsConfig } from "@workspace/eslint-config/next-js";
import { globalIgnores } from "eslint/config";

import { typedPromises } from "@workspace/eslint-config/typed";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  typedPromises,
  {
    files: ["**/*.{tsx,jsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.type=JSXIdentifier][name.name=/^(button|input|textarea|select|label|svg)$/]",
          message: "Use shared shadcn controls and lucide-react icons.",
        },
      ],
    },
  },
  globalIgnores(["convex/_generated/**"]),
];
