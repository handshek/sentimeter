import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@workspace/ui/components/button";
import { useCopyFeedback } from "./use-copy-feedback";

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);

afterEach(() => {
  cleanup();
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  }
});

function CopyKey() {
  const { status, copy } = useCopyFeedback("key", 60);
  return (
    <Button type="button" onClick={() => void copy()}>
      {status === "copied" ? "Copied" : "Copy key"}
    </Button>
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("a second copy keeps its confirmation for the full reset delay", async () => {
  const pending: Array<() => void> = [];
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: () =>
        new Promise<void>((resolve) => {
          pending.push(resolve);
        }),
    },
  });
  render(<CopyKey />);
  fireEvent.click(screen.getByRole("button", { name: "Copy key" }));
  fireEvent.click(screen.getByRole("button", { name: "Copy key" }));

  pending[0]!();
  await wait(30);
  pending[1]!();
  await screen.findByRole("button", { name: "Copied" });
  await wait(40);

  expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
});
