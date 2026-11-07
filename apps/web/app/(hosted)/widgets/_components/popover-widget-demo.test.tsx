import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  PopoverWidgetDemo,
  type WidgetCommon,
} from "./widgets-playground-client";

afterEach(cleanup);

const common: WidgetCommon = {
  location: "/widgets",
  disabled: false,
  thankYouMessage: "Thanks!",
  doneDurationMs: 30,
  submitLabel: "Submit",
  submit: async () => {},
  submitMode: "mock",
  title: "Rate your experience",
  description: "Tell us how it went.",
  showInput: false,
  size: "default",
};

function openPopover() {
  fireEvent.click(
    screen.getByRole("button", { name: "Open feedback popover" }),
  );
}

test("popover closes after the thank-you and reopens with a fresh widget", async () => {
  render(<PopoverWidgetDemo common={common} />);
  openPopover();
  fireEvent.click(screen.getByRole("button", { name: "Rating 4 of 5" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await screen.findByText("Thanks!");

  await new Promise((resolve) => setTimeout(resolve, 80));
  expect(screen.queryByText("Thanks!")).toBeNull();
  expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();

  openPopover();
  expect(
    screen
      .getByRole("button", { name: "Rating 4 of 5" })
      .getAttribute("aria-pressed"),
  ).toBe("false");
});

test("closing the widget closes the popover", () => {
  render(<PopoverWidgetDemo common={common} />);
  openPopover();
  fireEvent.click(
    screen.getByRole("button", { name: "Dismiss feedback widget" }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Open feedback popover" })
      .getAttribute("aria-expanded"),
  ).toBe("false");
});

test("a submission that finishes after dismissal does not close a reopened popover", async () => {
  let finishFirst = () => {};
  const submit = () =>
    new Promise<void>((resolve) => {
      finishFirst = resolve;
    });
  render(<PopoverWidgetDemo common={{ ...common, submit }} />);
  openPopover();
  fireEvent.click(screen.getByRole("button", { name: "Rating 4 of 5" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Dismiss feedback widget" }),
  );

  openPopover();
  finishFirst();
  await new Promise((resolve) => setTimeout(resolve, 80));
  expect(screen.getByRole("dialog")).toBeTruthy();
});
