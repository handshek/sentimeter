import { config } from "@workspace/eslint-config/base";
import globals from "globals";

export default [
  { ignores: ["**/*", "!scripts/", "!scripts/**"] },
  ...config,
  { languageOptions: { globals: globals.node } },
];
