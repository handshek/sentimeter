import { config as baseConfig } from "@workspace/eslint-config/base";
import globals from "globals";

export default [
  ...baseConfig,
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
