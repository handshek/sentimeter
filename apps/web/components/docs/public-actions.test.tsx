import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CopyButton } from "./copy-button";
import { WidgetDemo } from "./widget-demo";
import { WidgetInstallCommand } from "./widget-install-command";
import { REGISTRY_BASE_URL, widgetDocs } from "@/lib/widget-catalog";

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

test("local demo submits without a request and resets selection with keyboard focus", async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = Object.assign(
    async () => {
      requests += 1;
      throw new Error("A local preview must not make a request");
    },
    { preconnect: originalFetch.preconnect },
  );

  try {
    const view = render(<WidgetDemo widget={widgetDocs[0]!} />);
    const reaction = screen
      .getAllByRole("button")
      .find((button) => button.hasAttribute("aria-pressed"))!;
    fireEvent.click(reaction);
    expect(reaction.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByText("Thanks!");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    const firstReaction = screen
      .getAllByRole("button")
      .find((button) => button.hasAttribute("aria-pressed"))!;
    expect(firstReaction.getAttribute("aria-pressed")).toBe("false");
    expect(document.activeElement).toBe(firstReaction);
    fireEvent.click(firstReaction);
    view.rerender(
      <WidgetDemo
        widget={widgetDocs[0]!}
        options={{ variant: "icons", size: "lg" }}
      />,
    );
    expect(
      screen
        .getAllByRole("button")
        .filter((button) => button.getAttribute("aria-pressed") === "true"),
    ).toHaveLength(0);
    const iconReaction = screen
      .getAllByRole("button")
      .find((button) => button.hasAttribute("aria-pressed"))!;
    fireEvent.click(iconReaction);
    view.rerender(
      <WidgetDemo
        widget={widgetDocs[0]!}
        options={{ variant: "icons", size: "lg", layout: "inline" }}
      />,
    );
    expect(
      screen
        .getAllByRole("button")
        .filter((button) => button.getAttribute("aria-pressed") === "true"),
    ).toHaveLength(0);
    expect(requests).toBe(0);
  } finally {
    globalThis.fetch = originalFetch;
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

test("a package manager chosen once is used by every install command, including later pages", () => {
  localStorage.clear();
  try {
    render(
      <>
        <WidgetInstallCommand registryName="emoji-feedback" />
        <WidgetInstallCommand registryName="star-rating" />
      </>,
    );
    fireEvent.mouseDown(screen.getAllByRole("tab", { name: "pnpm" })[0]!, {
      button: 0,
    });
    expect(
      screen.getByText(
        `pnpm dlx shadcn@latest add "${REGISTRY_BASE_URL}/star-rating.json"`,
      ),
    ).toBeTruthy();

    cleanup();
    render(<WidgetInstallCommand registryName="like-dislike" />);
    expect(
      screen.getByText(
        `pnpm dlx shadcn@latest add "${REGISTRY_BASE_URL}/like-dislike.json"`,
      ),
    ).toBeTruthy();
  } finally {
    localStorage.clear();
  }
});

test("a new package manager choice still applies when storage rejects writes", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage")!;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => "yarn",
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    },
  });
  try {
    render(<WidgetInstallCommand registryName="star-rating" />);
    fireEvent.mouseDown(screen.getByRole("tab", { name: "pnpm" }), {
      button: 0,
    });
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe(
      "pnpm",
    );
  } finally {
    Object.defineProperty(globalThis, "localStorage", original);
  }
});

test("a copy result for the previous text clears when the text changes", async () => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      async writeText() {},
    },
  });
  const view = render(<CopyButton text="old-key" label="Copy key" />);
  fireEvent.click(screen.getByRole("button", { name: "Copy key" }));
  await screen.findByRole("button", { name: "Copied" });

  view.rerender(<CopyButton text="new-key" label="Copy key" />);

  expect(screen.getByRole("button", { name: "Copy key" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("");

  view.rerender(<CopyButton text="old-key" label="Copy key" />);

  expect(screen.getByRole("button", { name: "Copy key" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("");
});
