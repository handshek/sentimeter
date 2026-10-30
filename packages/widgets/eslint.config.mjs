import { config as reactInternalConfig } from "@workspace/eslint-config/react-internal";

import { typedPromises } from "@workspace/eslint-config/typed";

/** @type {import("eslint").Linter.Config[]} */
export default [...reactInternalConfig, typedPromises];
