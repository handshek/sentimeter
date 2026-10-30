import { config as baseConfig } from "@workspace/eslint-config/base";
import globals from "globals";

import { typedPromises } from "@workspace/eslint-config/typed";

export default [
  ...baseConfig,
  typedPromises,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.serviceworker,
      },
    },
  },
  {
    ignores: [
      ".generated/**",
      ".tmp/**",
      "public/**",
      "worker-configuration.d.ts",
    ],
  },
];
