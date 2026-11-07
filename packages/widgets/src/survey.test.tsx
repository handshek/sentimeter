import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { Survey, type WidgetPayload } from "./index";

afterEach(cleanup);

test("survey pick reveals its note and sends the selected reason with trimmed text", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <Survey
      location="cancel-plan"
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  assert.ok(screen.getByRole("radiogroup", { name: "Why are you leaving?" }));
  assert.equal(screen.getAllByRole("radio").length, 5);
  assert.equal(screen.queryByRole("textbox"), null);
  assert.equal(
    (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
      .disabled,
    true,
  );
  const reason = screen.getByRole("radio", { name: "Something didn't work" });
  fireEvent.click(reason);
  assert.equal(reason.getAttribute("aria-checked"), "true");
  fireEvent.change(
    screen.getByRole("textbox", { name: "What didn't work? (optional)" }),
    { target: { value: "  CSV export timed out  " } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Thanks for telling us.");
  assert.deepEqual(payloads, [
    {
      widgetType: "survey",
      location: "cancel-plan",
      value: "not-working",
      text: "CSV export timed out",
    },
  ]);
  assert.equal((reason as HTMLButtonElement).disabled, true);
  assert.equal(reason.getAttribute("aria-checked"), "true");
  assert.equal(screen.queryByRole("textbox"), null);
});

test("custom options keep their values and note prompt; an empty note is omitted", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <Survey
      options={[
        {
          label: "Leaving the team",
          value: "team",
          notePlaceholder: "Which team? (optional)",
        },
      ]}
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  fireEvent.click(screen.getByRole("radio", { name: "Leaving the team" }));
  fireEvent.change(
    screen.getByRole("textbox", { name: "Which team? (optional)" }),
    { target: { value: "  " } },
  );
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Thanks for telling us.");
  assert.deepEqual(payloads, [
    { widgetType: "survey", location: "/", value: "team" },
  ]);
});

test("changing a reason clears its note and updates the prompt", () => {
  render(<Survey />);
  fireEvent.click(screen.getByRole("radio", { name: "Too expensive" }));
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "A different plan" },
  });
  fireEvent.click(screen.getByRole("radio", { name: "Other" }));
  assert.equal(
    (
      screen.getByRole("textbox", {
        name: "Tell us more (optional)",
      }) as HTMLTextAreaElement
    ).value,
    "",
  );
});

test("Skip is hidden when the host gives it nothing to do", () => {
  render(<Survey />);
  assert.equal(screen.queryByRole("button", { name: "Skip" }), null);
});

test("Skip delegates to the host without submitting or completing", () => {
  let skips = 0;
  const payloads: WidgetPayload[] = [];
  render(
    <Survey
      onSkip={() => skips++}
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  fireEvent.click(screen.getByRole("radio", { name: "Other" }));
  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  assert.equal(skips, 2);
  assert.deepEqual(payloads, []);
  assert.equal(screen.queryByRole("status"), null);
  assert.equal(
    screen.getByRole("radio", { name: "Other" }).getAttribute("aria-checked"),
    "true",
  );
});

test("arrow keys choose and focus adjacent radios with one tab stop", () => {
  render(<Survey />);
  const reasons = screen.getAllByRole("radio");
  const first = reasons[0]!;
  act(() => first.focus());
  fireEvent.keyDown(first, { key: "ArrowDown" });
  assert.equal(document.activeElement, reasons[1]);
  assert.equal(reasons[1]!.getAttribute("aria-checked"), "true");
  assert.equal(reasons.filter((reason) => reason.tabIndex === 0).length, 1);
  fireEvent.keyDown(reasons[1]!, { key: "End" });
  assert.equal(document.activeElement, reasons[4]);
  fireEvent.keyDown(reasons[4]!, { key: "ArrowRight" });
  assert.equal(document.activeElement, first);
  fireEvent.keyDown(first, { key: "ArrowUp" });
  assert.equal(document.activeElement, reasons[4]);
  fireEvent.keyDown(reasons[4]!, { key: "Home" });
  assert.equal(document.activeElement, first);
  fireEvent.keyDown(first, { key: "ArrowLeft" });
  assert.equal(document.activeElement, reasons[4]);
  assert.equal(reasons[4]!.getAttribute("aria-checked"), "true");
});

test("survey failure retains the reason and note for retry, and pending blocks Skip", async () => {
  const payloads: WidgetPayload[] = [];
  let skips = 0;
  let finish!: () => void;
  render(
    <Survey
      onSkip={() => skips++}
      submit={async (payload) => {
        payloads.push(payload);
        if (payloads.length === 1) throw new Error("offline");
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
      }}
    />,
  );
  fireEvent.click(
    screen.getByRole("radio", { name: "Missing a feature I need" }),
  );
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "Team permissions" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  assert.equal(skips, 0);
  assert.equal(
    (screen.getByRole("textbox") as HTMLTextAreaElement).disabled,
    true,
  );
  assert.equal(
    (screen.getByRole("textbox") as HTMLTextAreaElement).value,
    "Team permissions",
  );
  assert.ok(
    screen
      .getAllByRole("radio")
      .every((reason) => (reason as HTMLButtonElement).disabled),
  );
  await act(async () => finish());
  assert.deepEqual(payloads, [
    {
      widgetType: "survey",
      location: "/",
      value: "missing-feature",
      text: "Team permissions",
    },
    {
      widgetType: "survey",
      location: "/",
      value: "missing-feature",
      text: "Team permissions",
    },
  ]);
});

test("survey completes locally and calls onDone after showing thanks", async () => {
  let done = 0;
  render(<Survey onDone={() => done++} />);
  fireEvent.click(screen.getByRole("radio", { name: "Other" }));
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Thanks for telling us.");
  assert.equal(done, 0);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2100));
  });
  assert.equal(done, 1);
  assert.ok(screen.getByRole("status"));
});

test("disabled survey cannot choose or skip", () => {
  let skips = 0;
  render(<Survey disabled onSkip={() => skips++} />);
  fireEvent.click(screen.getByRole("radio", { name: "Other" }));
  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  assert.equal(skips, 0);
  assert.equal(screen.queryByRole("textbox"), null);
});
