import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { WidgetPayload } from "../index";
import { FloatingFeedback } from "./floating-feedback";
import { ReportProblem } from "./report-problem";
import ErrorPage from "./error-feedback";
import { WasThisHelpful } from "./was-this-helpful";
import { AfterTaskRating } from "./after-task-rating";
import { CancelFlowSurvey } from "./cancel-flow-survey";

afterEach(cleanup);

function type(text: string) {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
}

test("floating pill opens the form and closes it after the thank-you, returning focus", async () => {
  const payloads: WidgetPayload[] = [];
  render(<FloatingFeedback submit={async (p) => void payloads.push(p)} />);
  const pill = screen.getByRole("button", { name: "Feedback" });
  fireEvent.click(pill);
  type("Save does nothing");
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Got it. Sorry about that.");
  assert.equal(payloads[0]?.location, "floating-feedback");
  await waitFor(
    () => assert.equal(screen.queryByText("Got it. Sorry about that."), null),
    { timeout: 3000 },
  );
  assert.equal(document.activeElement, pill);
});

test("report a problem opens the form in a dialog", () => {
  render(<ReportProblem />);
  fireEvent.click(screen.getByRole("button", { name: "Report a problem" }));
  assert.ok(screen.getByRole("dialog", { name: "Report a problem" }));
  assert.ok(screen.getByRole("textbox", { name: "What happened?" }));
});

test("error page retries and keeps the error message off the page", async () => {
  let resets = 0;
  render(
    <ErrorPage
      error={Object.assign(new Error("secret detail"), { digest: "d1" })}
      reset={() => resets++}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  assert.equal(resets, 1);
  assert.equal(screen.queryByText(/secret detail/), null);
});

test("cancel flow sends the reason, then runs the host cancellation", async () => {
  const calls: string[] = [];
  render(
    <CancelFlowSurvey
      submit={async (p) =>
        void calls.push(`sent:${"value" in p ? p.value : ""}`)
      }
      cancelPlan={() => void calls.push("cancelled")}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel plan" }));
  fireEvent.click(screen.getByRole("radio", { name: "Too expensive" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Cancel plan" }));
  });
  await screen.findByText("Your plan is cancelled. Thanks for telling us.");
  assert.deepEqual(calls, ["sent:too-expensive", "cancelled"]);
});

test("Keep my plan closes the dialog without cancelling", () => {
  let cancelled = 0;
  render(<CancelFlowSurvey cancelPlan={() => void cancelled++} />);
  fireEvent.click(screen.getByRole("button", { name: "Cancel plan" }));
  fireEvent.click(screen.getByRole("button", { name: "Keep my plan" }));
  assert.equal(screen.queryByRole("dialog"), null);
  assert.equal(cancelled, 0);
});

test("rating blocks render their placement copy", () => {
  render(
    <>
      <WasThisHelpful />
      <AfterTaskRating />
    </>,
  );
  assert.ok(screen.getByText("Was this helpful?"));
  assert.ok(screen.getByText("Order placed"));
  assert.ok(screen.getByText("How was checkout?"));
});
