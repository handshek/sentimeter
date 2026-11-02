/** @type {import("eslint").Linter.Config} */
export const typedPromises = {
  files: ["**/*.{ts,tsx,mts,cts}"],
  languageOptions: { parserOptions: { projectService: true } },
  rules: {
    "@typescript-eslint/no-floating-promises": [
      "error",
      {
        allowForKnownSafeCalls: [
          { from: "package", name: ["describe", "test"], package: "node:test" },
        ],
      },
    ],
  },
};
