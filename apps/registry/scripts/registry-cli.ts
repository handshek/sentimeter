import { RegistryAdapterError } from "./registry-plan";
import { runRegistryCommand } from "./registry-adapter";

const mode = process.argv[2];

if (mode !== "emit" && mode !== "check" && mode !== "build") {
  console.error("Usage: bun run scripts/registry-cli.ts <emit|check|build>");
  process.exitCode = 1;
} else {
  try {
    await runRegistryCommand(mode);
    const result =
      mode === "emit"
        ? "Registry staging emitted."
        : mode === "check"
          ? "Registry staging and temporary build are valid."
          : "Registry staging and public output built successfully.";
    console.log(result);
  } catch (error) {
    const prefix =
      error instanceof RegistryAdapterError
        ? `Registry ${error.code}`
        : "Registry command failed";
    console.error(
      `${prefix}: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 1;
  }
}
