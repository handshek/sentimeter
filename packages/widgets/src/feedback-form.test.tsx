import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { FeedbackForm, WidgetSubmitError, type WidgetPayload } from "./index";

afterEach(cleanup);

function enter(text = "Save did nothing") {
  fireEvent.change(screen.getByRole("textbox", { name: "What happened?" }), {
    target: { value: text },
  });
}

test("form sends trimmed text with context collected at submit time", async () => {
  const payloads: WidgetPayload[] = [];
  const previousUrl = window.location.href;
  const ua = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
  });
  try {
    window.location.href = "https://app.example/settings";
    render(
      <FeedbackForm
        location="billing-report"
        submit={async (payload) => {
          payloads.push(payload);
        }}
      />,
    );
    enter("  Save did nothing  ");
    window.location.href =
      "https://app.example/settings/billing?tab=plan#details";
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("Got it. Sorry about that.");
    assert.deepEqual(payloads, [
      {
        widgetType: "form",
        location: "billing-report",
        text: "Save did nothing",
        context: {
          url: "https://app.example/settings/billing",
          route: "/settings/billing",
          browser: "Chrome",
          os: "macOS",
          viewport: { width: window.innerWidth, height: window.innerHeight },
        },
      },
    ]);
    assert.equal(
      screen.getByRole("status").textContent,
      "Got it. Sorry about that.We read every message.",
    );
  } finally {
    window.location.href = previousUrl;
    if (ua) Object.defineProperty(window.navigator, "userAgent", ua);
    else Reflect.deleteProperty(window.navigator, "userAgent");
  }
});

test("empty and whitespace-only form text cannot send", () => {
  const payloads: WidgetPayload[] = [];
  render(
    <FeedbackForm
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  const send = screen.getByRole("button", {
    name: "Send",
  }) as HTMLButtonElement;
  assert.equal(send.disabled, true);
  enter(" \n ");
  assert.equal(send.disabled, true);
  fireEvent.click(send);
  assert.deepEqual(payloads, []);
});

test("form retains text after failure and retries once while blocking pending sends", async () => {
  const payloads: WidgetPayload[] = [];
  let finish!: () => void;
  render(
    <FeedbackForm
      submit={async (payload) => {
        payloads.push(payload);
        if (payloads.length === 1)
          throw new WidgetSubmitError(
            "network_error",
            "Could not save your message.",
          );
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
      }}
    />,
  );
  enter();
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  const retry = await screen.findByRole("button", { name: "Try again" });
  assert.equal(
    screen.getByRole("status").textContent,
    "Could not save your message.",
  );
  assert.equal(
    (screen.getByRole("textbox") as HTMLTextAreaElement).value,
    "Save did nothing",
  );
  fireEvent.click(retry);
  assert.equal(
    (screen.getByRole("textbox") as HTMLTextAreaElement).disabled,
    true,
  );
  fireEvent.click(screen.getByRole("button", { name: "Sending…" }));
  assert.equal(payloads.length, 2);
  await act(async () => finish());
  assert.equal(screen.queryByRole("textbox"), null);
  assert.deepEqual(payloads[0], payloads[1]);
});

test("local completion calls the latest onDone once after two seconds", async () => {
  const calls: string[] = [];
  const view = render(<FeedbackForm onDone={() => calls.push("original")} />);
  enter();
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Got it. Sorry about that.");
  view.rerender(<FeedbackForm onDone={() => calls.push("latest")} />);
  assert.deepEqual(calls, []);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2100));
  });
  assert.deepEqual(calls, ["latest"]);
  assert.ok(screen.getByText("We read every message."));
});

test("unmount cancels the container completion callback", async () => {
  let calls = 0;
  const view = render(<FeedbackForm onDone={() => calls++} />);
  enter();
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Got it. Sorry about that.");
  view.unmount();
  await new Promise((resolve) => setTimeout(resolve, 2100));
  assert.equal(calls, 0);
});

test("disabled form cannot edit or submit", () => {
  render(<FeedbackForm disabled />);
  enter();
  assert.equal((screen.getByRole("textbox") as HTMLTextAreaElement).value, "");
  assert.equal(
    (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
      .disabled,
    true,
  );
});
