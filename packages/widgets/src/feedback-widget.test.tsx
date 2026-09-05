import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  EmojiFeedback,
  LikeDislike,
  StarRating,
  type WidgetPayload,
} from "./index";

const originalFetch = globalThis.fetch;

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

describe("rendered feedback widget", () => {
  const ratingCases = [
    {
      name: "emoji symbols",
      render: (size: "sm" | "lg", disabled = false) => (
        <EmojiFeedback size={size} variant="emoji" disabled={disabled} />
      ),
      firstControlName: "Rating 1 of 5",
      controlCount: 5,
    },
    {
      name: "emoji icons",
      render: (size: "sm" | "lg", disabled = false) => (
        <EmojiFeedback size={size} variant="icons" disabled={disabled} />
      ),
      firstControlName: "Angry (1 of 5)",
      controlCount: 5,
    },
    {
      name: "thumb icons",
      render: (size: "sm" | "lg", disabled = false) => (
        <LikeDislike size={size} variant="icons" disabled={disabled} />
      ),
      firstControlName: "Like",
      controlCount: 2,
    },
    {
      name: "thumb emoji",
      render: (size: "sm" | "lg", disabled = false) => (
        <LikeDislike size={size} variant="emoji" disabled={disabled} />
      ),
      firstControlName: "Dislike",
      controlCount: 2,
    },
    {
      name: "star icons",
      render: (size: "sm" | "lg", disabled = false) => (
        <StarRating size={size} variant="icons" disabled={disabled} />
      ),
      firstControlName: "Rate 1 star",
      controlCount: 5,
    },
    {
      name: "star emoji",
      render: (size: "sm" | "lg", disabled = false) => (
        <StarRating size={size} variant="emoji" disabled={disabled} />
      ),
      firstControlName: "Rate 1 star",
      controlCount: 5,
    },
  ] as const;

  for (const ratingCase of ratingCases) {
    for (const size of ["sm", "lg"] as const) {
      test(`${ratingCase.name} at ${size} keeps accessible, selectable controls`, () => {
        const { container } = render(ratingCase.render(size));
        const controls = container.querySelectorAll<HTMLButtonElement>(
          "button[aria-pressed]",
        );
        const firstControl = screen.getByRole("button", {
          name: ratingCase.firstControlName,
        });

        assert.equal(controls.length, ratingCase.controlCount);

        act(() => firstControl.focus());
        fireEvent.click(firstControl);

        assert.equal(document.activeElement, firstControl);
        assert.equal(firstControl.getAttribute("aria-pressed"), "true");
      });

      test(`${ratingCase.name} at ${size} exposes its disabled state`, () => {
        const { container } = render(ratingCase.render(size, true));
        const controls = container.querySelectorAll<HTMLButtonElement>(
          "button[aria-pressed]",
        );

        assert.equal(controls.length, ratingCase.controlCount);
        for (const control of controls) {
          assert.equal(control.disabled, true);
        }
      });
    }
  }

  test("completes the full lifecycle locally when no submit method is configured", async () => {
    const events: string[] = [];
    let submittedPayload: WidgetPayload | undefined;
    let networkCalled = false;
    globalThis.fetch = async () => {
      networkCalled = true;
      return new Response(null, { status: 200 });
    };

    render(
      <LikeDislike
        apiKey="   "
        onSelect={() => events.push("select")}
        onStateChange={(state) => events.push(state)}
        onSubmitStart={(payload) => {
          submittedPayload = payload;
          events.push("start");
        }}
        onSubmitSuccess={() => events.push("success")}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(networkCalled, false);
    assert.deepEqual(events, [
      "select",
      "selected",
      "submitting",
      "start",
      "success",
      "done",
    ]);
    assert.deepEqual(submittedPayload, {
      apiKey: "",
      location: "/",
      widgetType: "thumbs",
      value: 1,
    });
  });

  test("shows a safe inline error and retries the same current response", async () => {
    const rawError = new Error("private provider details");
    const payloads: WidgetPayload[] = [];
    const callbackErrors: unknown[] = [];
    let attempts = 0;

    render(
      <LikeDislike
        showInput
        autoHide={false}
        submit={async (payload) => {
          attempts += 1;
          payloads.push(payload);
          if (attempts === 1) throw rawError;
        }}
        onSubmitError={(error) => callbackErrors.push(error)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    const input = screen.getByPlaceholderText(
      "Share your thoughts",
    ) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "Clear and useful" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    const errorStatus = (
      await screen.findByText("We couldn't send your feedback. Try again.")
    ).closest('[role="status"]');
    assert.ok(errorStatus);
    assert.equal(
      errorStatus.textContent,
      "We couldn't send your feedback. Try again.",
    );
    assert.equal(callbackErrors[0], rawError);
    assert.equal(input.value, "Clear and useful");
    assert.equal(
      screen.getByRole("button", { name: "Like" }).getAttribute("aria-pressed"),
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));

    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(payloads.length, 2);
    assert.deepEqual(payloads[1], payloads[0]);
  });

  test("keeps success visible when auto-hide is disabled and focuses its status", async () => {
    render(<LikeDislike autoHide={false} doneDurationMs={1} />);

    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    const submitButton = screen.getByRole("button", { name: "Submit" });
    submitButton.focus();
    fireEvent.click(submitButton);

    const successStatus = (await screen.findByText("Thanks!")).closest(
      '[role="status"]',
    );
    assert.ok(successStatus);
    assert.equal(successStatus.textContent, "Thanks!");
    assert.equal(document.activeElement, successStatus);

    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.ok(screen.getByText("Thanks!"));
  });

  test("returns focus to a hidden anchor after automatic dismissal", async () => {
    render(<LikeDislike doneDurationMs={20} />);

    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    const submitButton = screen.getByRole("button", { name: "Submit" });
    submitButton.focus();
    fireEvent.click(submitButton);

    assert.ok(await screen.findByText("Thanks!"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    assert.equal(screen.queryByText("Thanks!"), null);

    const focusAnchor = screen.getByText("Feedback widget closed");
    assert.equal(document.activeElement, focusAnchor);
  });

  test("does not steal focus when the user moves elsewhere during submission", async () => {
    let resolveSubmit!: () => void;
    const pendingSubmit = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    render(
      <>
        <button type="button">Outside action</button>
        <LikeDislike autoHide={false} submit={() => pendingSubmit} />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    const submitButton = screen.getByRole("button", { name: "Submit" });
    submitButton.focus();
    fireEvent.click(submitButton);

    assert.equal(screen.getByRole("status").textContent, "Submitting feedback");
    assert.ok(submitButton.closest('[aria-busy="true"]'));

    const outsideButton = screen.getByRole("button", {
      name: "Outside action",
    });
    outsideButton.focus();
    resolveSubmit();

    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(document.activeElement, outsideButton);
  });

  test("returns focus to the same anchor after explicit dismissal", () => {
    let cancelled = false;
    render(<LikeDislike closeButton onCancel={() => (cancelled = true)} />);

    const dismissButton = screen.getByRole("button", {
      name: "Dismiss feedback widget",
    });
    dismissButton.focus();
    fireEvent.click(dismissButton);

    const focusAnchor = screen.getByText("Feedback widget closed");
    assert.equal(cancelled, true);
    assert.equal(document.activeElement, focusAnchor);
  });
});
