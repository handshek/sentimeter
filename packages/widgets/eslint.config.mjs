import { config as reactInternalConfig } from "@workspace/eslint-config/react-internal";

import { typedPromises } from "@workspace/eslint-config/typed";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternalConfig,
  typedPromises,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.type=Identifier][callee.name=/^on[A-Z]/], CallExpression[callee.type=MemberExpression][callee.computed=false][callee.property.name=/^on[A-Z]/], CallExpression[callee.type=MemberExpression][callee.computed=true][callee.property.value=/^on[A-Z]/]",
          message:
            "Route host observers through notify so their failures stay isolated.",
        },
      ],
    },
  },
];
