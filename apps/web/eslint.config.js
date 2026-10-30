import { nextJsConfig } from "@workspace/eslint-config/next-js";
import { globalIgnores } from "eslint/config";

import { typedPromises } from "@workspace/eslint-config/typed";

const rawControlRestriction = {
  selector:
    "JSXOpeningElement[name.type=JSXIdentifier][name.name=/^(button|input|textarea|select|label|svg)$/]",
  message: "Use shared shadcn controls and lucide-react icons.",
};

const parentImportRestriction = {
  selector:
    "ImportExpression[source.type=Literal][source.value=/^(?:[.][/])*[.][.](?:[/]|$)/]",
  message: "Use @/ imports outside the current folder.",
};

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  typedPromises,
  { rules: { "no-restricted-syntax": ["error", rawControlRestriction] } },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}"],
    ignores: ["convex/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        rawControlRestriction,
        parentImportRestriction,
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:\\./)*\\.\\.(?:/|$)",
              message: "Use @/ imports outside the current folder.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores(["convex/_generated/**"]),
];
