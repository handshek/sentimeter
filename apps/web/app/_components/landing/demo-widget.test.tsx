import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DemoWidget } from "./demo-widget";

describe("landing-page demo widget", () => {
  test("allocates the widget a real host width instead of shrink-wrapping it", () => {
    const markup = renderToStaticMarkup(
      <DemoWidget kind="emoji" label="Emoji Feedback" />,
    );

    assert.match(markup, /class="flex w-full flex-col items-center gap-4"/);
    assert.match(
      markup,
      /class="group\/preview relative w-full overflow-hidden/,
    );
    assert.match(
      markup,
      /class="relative flex items-center justify-center px-0 py-10/,
    );
  });

  test("passes React keys directly instead of spreading them as widget props", () => {
    const errors: string[] = [];
    const originalConsoleError = console.error;
    console.error = (...values: unknown[]) => {
      errors.push(values.map(String).join(" "));
    };

    try {
      renderToStaticMarkup(
        <DemoWidget kind="emoji" label="Emoji Feedback" />,
      );
    } finally {
      console.error = originalConsoleError;
    }

    assert.equal(
      errors.some((message) => message.includes('containing a "key" prop')),
      false,
    );
  });
});
