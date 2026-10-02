import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CopyButton } from "./copy-button";

const originalClipboard = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);

afterEach(() => {
  cleanup();
  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", originalClipboard);
  } else {
    Reflect.deleteProperty(navigator, "clipboard");
  }
});

test("copy failure offers the exact text and never claims success; retry announces success", async () => {
  let attempts = 0;
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      async writeText(text: string) {
        expect(text).toBe("bunx shadcn@latest add @sentimeter/emoji-feedback");
        if (++attempts === 1) throw new Error("Clipboard permission denied");
      },
    },
  });
  render(
    <CopyButton text="bunx shadcn@latest add @sentimeter/emoji-feedback" />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Copy Code" }));
  await screen.findByRole("alert");
  expect(screen.queryByRole("button", { name: "Copied" })).toBeNull();
  expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe(
    "bunx shadcn@latest add @sentimeter/emoji-feedback",
  );

  fireEvent.click(screen.getByRole("button", { name: "Copy Code" }));
  await screen.findByRole("button", { name: "Copied" });
  expect(screen.getByRole("status").textContent).toContain(
    "copied to clipboard",
  );
  expect(screen.queryByRole("alert")).toBeNull();
});
