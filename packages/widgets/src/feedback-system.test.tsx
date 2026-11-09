import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import { cleanup, render, screen } from "@testing-library/react";
import { LikeDislike } from "./index";

afterEach(cleanup);

describe("canonical widget feedback system", () => {
  test("shows Like before Dislike", () => {
    render(<LikeDislike />);
    assert.deepEqual(
      screen.getAllByRole("button").map((button) => button.textContent),
      ["Like", "Dislike"],
    );
  });

  test("lets consumer classes replace conflicting defaults", () => {
    const { container } = render(<LikeDislike className="max-w-none" />);
    const root = container.querySelector('[data-slot="feedback-widget"]');
    assert.match(root?.className ?? "", /(^|\s)max-w-none(\s|$)/);
    assert.doesNotMatch(root?.className ?? "", /max-w-\[/);
  });
});
