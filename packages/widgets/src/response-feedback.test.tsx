import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { ResponseFeedback, type WidgetPayload } from "./index";

afterEach(cleanup);

test("good sends at once and leaves only the filled thumb", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <ResponseFeedback
      responseId="msg_1"
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Good response" }));
  await screen.findByText("Thanks for the feedback");
  assert.deepEqual(payloads, [
    { location: "/", widgetType: "response", value: 1, responseId: "msg_1" },
  ]);
  const good = screen.getByRole("button", { name: "Good response" });
  assert.equal(good.getAttribute("aria-pressed"), "true");
  assert.equal((good as HTMLButtonElement).disabled, true, "the vote is final");
  assert.equal(screen.queryByRole("button", { name: "Bad response" }), null);
});

test("bad asks for a reason and note; Cancel returns both thumbs", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <ResponseFeedback
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Bad response" }));
  const send = screen.getByRole("button", {
    name: "Send",
  }) as HTMLButtonElement;
  assert.equal(send.disabled, true, "a reason or note is needed");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  assert.equal(screen.queryByText("What went wrong?"), null);
  assert.deepEqual(payloads, []);

  fireEvent.click(screen.getByRole("button", { name: "Bad response" }));
  fireEvent.click(screen.getByRole("radio", { name: "Too long" }));
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "  Skip the preamble " },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Thanks for the feedback");
  assert.deepEqual(payloads, [
    {
      location: "/",
      widgetType: "response",
      value: 0,
      reason: "Too long",
      text: "Skip the preamble",
    },
  ]);
  assert.equal(screen.queryByRole("button", { name: "Good response" }), null);
});

test("a failed good vote can be picked again", async () => {
  let attempts = 0;
  render(
    <ResponseFeedback
      submit={async () => {
        attempts += 1;
        if (attempts === 1) throw new Error("offline");
      }}
    />,
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Good response" }));
  });
  assert.ok(screen.getByText(/Pick again to retry/));
  fireEvent.click(screen.getByRole("button", { name: "Good response" }));
  await screen.findByText("Thanks for the feedback");
  assert.equal(attempts, 2);
});
