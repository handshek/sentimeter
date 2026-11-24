import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { reportProblem, ToastFeedback, type WidgetPayload } from "./index";

beforeEach(() => window.sessionStorage.clear());
afterEach(cleanup);

test("a reported problem offers the toast once and attaches the error", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <ToastFeedback
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  assert.equal(screen.queryByText("Something not working?"), null);
  act(() => reportProblem(new TypeError("Failed to fetch")));
  fireEvent.click(screen.getByRole("button", { name: "Tell us" }));
  const box = screen.getByRole("textbox");
  assert.equal(document.activeElement, box);
  assert.ok(screen.getByText(/Error: Failed to fetch/));
  fireEvent.change(box, { target: { value: "Save spun forever" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Got it. Sorry about that.");
  const [payload] = payloads;
  assert.equal(payload?.widgetType, "form");
  assert.deepEqual(payload && "error" in payload ? payload.error : null, {
    name: "TypeError",
    message: "Failed to fetch",
  });

  fireEvent.click(screen.getByRole("button", { name: "Close feedback" }));
  act(() => reportProblem(new Error("again")));
  assert.equal(
    screen.queryByText("Something not working?"),
    null,
    "at most once per session",
  );
});

test("repeated clicks on something inert offer the toast; buttons do not", () => {
  render(
    <>
      <div>Static text</div>
      <button type="button">Real button</button>
      <ToastFeedback />
    </>,
  );
  const button = screen.getByRole("button", { name: "Real button" });
  for (let i = 0; i < 4; i += 1) fireEvent.click(button);
  assert.equal(screen.queryByText("Something not working?"), null);

  const inert = screen.getByText("Static text");
  for (let i = 0; i < 3; i += 1) fireEvent.click(inert);
  assert.ok(screen.getByText("Something not working?"));
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(screen.queryByText("Something not working?"), null);
});

test("the session limit survives a remount", () => {
  const { unmount } = render(<ToastFeedback />);
  act(() => reportProblem());
  unmount();
  render(<ToastFeedback />);
  act(() => reportProblem());
  assert.equal(screen.queryByText("Something not working?"), null);
});
