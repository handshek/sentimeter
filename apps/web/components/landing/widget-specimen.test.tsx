import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WidgetSpecimen } from "./widget-specimen";

afterEach(cleanup);

test("specimen thanks the visitor, then replays with focus on the first reaction", async () => {
  render(<WidgetSpecimen family="thumbs" />);
  fireEvent.click(screen.getByRole("button", { name: "Like" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await screen.findByText("Thanks for sharing.");

  fireEvent.click(screen.getByRole("button", { name: "Try again" }));

  const like = screen.getByRole("button", { name: "Like" });
  expect(like.getAttribute("aria-pressed")).toBe("false");
  expect(document.activeElement).toBe(like);
  expect(screen.getByRole("button", { name: "Reset example" })).toBeTruthy();
});
