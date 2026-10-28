export type CopyTextResult = "copied" | "manual";

type ClipboardWriter = {
  writeText(value: string): Promise<void>;
};

export async function copyText(
  value: string,
  clipboard: ClipboardWriter | undefined,
): Promise<CopyTextResult> {
  if (!clipboard) return "manual";

  try {
    await clipboard.writeText(value);
    return "copied";
  } catch {
    return "manual";
  }
}
