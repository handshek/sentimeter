import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import {
  EmojiFeedback,
  FeedbackFooter,
  FeedbackRating,
  FeedbackWidget,
  LikeDislike,
  StarRating,
  WidgetSubmitError,
  useFeedbackContext,
  type FeedbackStyle,
  type WidgetPayload,
} from "./index";

const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
});

function captureConsoleErrors() {
  const errors: unknown[][] = [];
  console.error = (...args: unknown[]) => {
    errors.push(args);
  };
  return errors;
}

describe("feedback widget lifecycle and theme", () => {
  const widgets = [
    {
      name: "faces",
      Component: EmojiFeedback,
      selectedControl: "Happy (4 of 5)",
      widgetType: "emoji",
      value: 4,
    },
    {
      name: "stars",
      Component: StarRating,
      selectedControl: "Rate 4 stars",
      widgetType: "star",
      value: 4,
    },
    {
      name: "thumbs",
      Component: LikeDislike,
      selectedControl: "Yes",
      widgetType: "thumbs",
      value: 1,
    },
  ] as const;

  {
    for (const widget of widgets) {
      test(`${widget.name} preserves its response through submission, retry, and success`, async () => {
        const payloads: WidgetPayload[] = [];
        let rejectFirstAttempt!: (reason: Error) => void;
        const firstAttempt = new Promise<void>((_resolve, reject) => {
          rejectFirstAttempt = reject;
        });
        const { container } = render(
          <widget.Component
            followUp="always"
            submit={async (payload) => {
              payloads.push(payload);
              if (payloads.length === 1) await firstAttempt;
            }}
          />,
        );
        const root = container.querySelector('[data-slot="feedback-widget"]');
        assert.ok(root);
        assert.equal(root.getAttribute("data-state"), "idle");

        const selectedControl = screen.getByRole("button", {
          name: widget.selectedControl,
        }) as HTMLButtonElement;
        fireEvent.click(selectedControl);
        const input = screen.getByRole("textbox", {
          name: "Additional feedback",
        }) as HTMLTextAreaElement;
        fireEvent.change(input, {
          target: { value: "A clear, useful experience" },
        });

        assert.equal(root.getAttribute("data-state"), "selected");
        assert.equal(payloads.length, 0, "selection does not submit feedback");
        assert.equal(selectedControl.getAttribute("aria-pressed"), "true");
        fireEvent.click(screen.getByRole("button", { name: "Send" }));

        assert.equal(root.getAttribute("data-state"), "submitting");
        assert.equal(root.getAttribute("aria-busy"), "true");
        assert.equal(selectedControl.disabled, true);
        assert.equal(input.disabled, true);

        await act(async () => rejectFirstAttempt(new Error("offline")));
        const retry = await screen.findByRole("button", { name: "Try again" });
        assert.equal(root.getAttribute("data-state"), "selected");
        assert.equal(input.value, "A clear, useful experience");
        assert.equal(input.disabled, false);
        assert.equal(selectedControl.disabled, false);
        assert.equal(selectedControl.getAttribute("aria-pressed"), "true");

        fireEvent.click(retry);
        assert.ok(await screen.findByText("Thanks!"));
        assert.equal(root.getAttribute("data-state"), "done");
        assert.equal(payloads.length, 2);
        assert.deepEqual(payloads[1], payloads[0]);
        assert.equal(payloads[1]?.widgetType, widget.widgetType);
        assert.equal(payloads[1]?.value, widget.value);
        assert.equal(payloads[1]?.text, "A clear, useful experience");
        assert.equal(selectedControl.disabled, true);
        assert.equal(selectedControl.getAttribute("aria-pressed"), "true");
        assert.equal(screen.queryByRole("textbox"), null);
        fireEvent.click(selectedControl);
        assert.equal(
          payloads.length,
          2,
          "completed feedback cannot be resubmitted",
        );
        assert.equal(screen.queryByRole("button", { name: "Send" }), null);
        assert.equal(screen.queryByRole("button", { name: "Try again" }), null);
      });
    }
  }

  for (const widget of widgets) {
    test(`${widget.name} uses the host theme and forwards consumer style overrides`, () => {
      const style = {
        "--feedback-inset": "1.75rem",
        "--feedback-radius": "0.875rem",
        color: "rebeccapurple",
      } satisfies FeedbackStyle;
      const { container } = render(<widget.Component style={style} />);
      const root = container.querySelector<HTMLElement>(
        '[data-slot="feedback-widget"]',
      );

      assert.ok(root);
      assert.equal(root.style.getPropertyValue("--feedback-inset"), "1.75rem");
      assert.equal(
        root.style.getPropertyValue("--feedback-radius"),
        "0.875rem",
      );
      assert.equal(root.style.color, "rebeccapurple");
    });
  }

  test("gives multiple widgets uniquely labelled text fields", () => {
    const { container } = render(
      <>
        <LikeDislike followUp="always" />
        <LikeDislike followUp="always" />
      </>,
    );
    const roots = container.querySelectorAll<HTMLElement>(
      '[data-slot="feedback-widget"]',
    );
    const ids: string[] = [];

    assert.equal(roots.length, 2);
    for (const root of roots) {
      fireEvent.click(within(root).getByRole("button", { name: "Yes" }));
      const input = within(root).getByLabelText(
        "Additional feedback (optional)",
        { selector: "textarea" },
      ) as HTMLTextAreaElement;
      ids.push(input.id);
    }
    assert.equal(new Set(ids).size, 2);
  });
});

describe("rendered feedback widget", () => {
  for (const scenario of [
    {
      name: "a wrapped submit label",
      submitLabel: "Send this feedback to the product team",
      cancelLabel: undefined,
      height: 58,
    },
  ]) {
    test(`preserves the action row footprint through pending, retry, and success with ${scenario.name}`, async () => {
      let rejectFirstAttempt!: (reason: Error) => void;
      const firstAttempt = new Promise<void>((_resolve, reject) => {
        rejectFirstAttempt = reject;
      });
      let attempts = 0;
      render(
        <FeedbackWidget
          widgetType="thumbs"
          submit={async () => {
            attempts += 1;
            if (attempts === 1) await firstAttempt;
          }}
        >
          <FeedbackRating variant="thumbs" />
          <FeedbackFooter
            submitLabel={scenario.submitLabel}
            showCancel={!!scenario.cancelLabel}
            cancelLabel={scenario.cancelLabel}
          />
        </FeedbackWidget>,
      );
      fireEvent.click(screen.getByRole("button", { name: "Yes" }));
      const submitButton = screen.getByRole("button", {
        name: scenario.submitLabel,
      });
      const actionRow = submitButton.parentElement;
      assert.ok(actionRow);
      let rowHeight = scenario.height;
      Object.defineProperty(actionRow, "offsetHeight", {
        configurable: true,
        get: () => rowHeight,
      });
      assert.equal(actionRow.style.minHeight, "");

      fireEvent.click(submitButton);
      assert.equal(screen.getByRole("status").textContent, "Sending feedback");
      const minimumHeight = `max(var(--feedback-action-height), ${scenario.height}px)`;
      assert.equal(actionRow.style.minHeight, minimumHeight);

      await act(async () => rejectFirstAttempt(new Error("offline")));
      const retry = await screen.findByRole("button", { name: "Try again" });
      assert.equal(actionRow.style.minHeight, minimumHeight);
      rowHeight = 44;
      fireEvent.click(retry);

      assert.ok(await screen.findByText("Thanks!"));
      assert.equal(attempts, 2);
    });
  }

  test("a finished card keeps its idle height", async () => {
    const observed: (() => void)[] = [];
    const original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        observed.push(callback);
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    } as unknown as typeof ResizeObserver;
    try {
      const { container } = render(<EmojiFeedback followUp="never" />);
      const content = container.querySelector<HTMLElement>(
        '[data-slot="feedback-widget"] > div',
      );
      assert.ok(content);
      Object.defineProperty(content, "offsetHeight", { get: () => 180 });
      act(() => observed.forEach((callback) => callback()));
      assert.equal(content.style.minHeight, "");

      fireEvent.click(screen.getByRole("button", { name: "Happy (4 of 5)" }));
      assert.ok(await screen.findByText("Your feedback helps us improve."));
      assert.equal(content.style.minHeight, "180px");
    } finally {
      globalThis.ResizeObserver = original;
    }
  });

  for (const [name, widget, controlCount] of [
    [
      "emoji icons",
      <EmojiFeedback followUp="always" key="emoji" disabled />,
      5,
    ],
    ["thumb icons", <LikeDislike followUp="always" key="thumbs" disabled />, 2],
    ["star icons", <StarRating followUp="always" key="stars" disabled />, 5],
  ] as const) {
    test(`${name} exposes the disabled state`, () => {
      const { container } = render(widget);
      const controls = container.querySelectorAll<HTMLButtonElement>(
        "button[aria-pressed]",
      );
      assert.equal(controls.length, controlCount);
      for (const control of controls) assert.equal(control.disabled, true);
    });
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
        followUp="always"
        onSelect={() => events.push("select")}
        onStateChange={(state) => events.push(state)}
        onSubmitStart={(payload) => {
          submittedPayload = payload;
          events.push("start");
        }}
        onSubmitSuccess={() => events.push("success")}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

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
        followUp="always"
        submit={async (payload) => {
          attempts += 1;
          payloads.push(payload);
          if (attempts === 1) throw rawError;
        }}
        onSubmitError={(error) => callbackErrors.push(error)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    const input = screen.getByPlaceholderText(
      "What went wrong?",
    ) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "Clear and useful" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    const errorStatus = (
      await screen.findByText("We couldn't send your feedback. Try again.")
    ).closest('[role="status"]');
    assert.ok(errorStatus);
    assert.equal(
      errorStatus.textContent,
      "We couldn't send your feedback. Try again.",
    );
    assert.equal(callbackErrors[0], rawError);
  });

  test("preserves custom submit error details and the feedback location on retry", async () => {
    const error = new WidgetSubmitError(
      "rate_limited",
      "Please wait before trying again.",
      {
        status: 429,
        retryAfterMs: 1000,
      },
    );
    const payloads: WidgetPayload[] = [];
    const failures: unknown[] = [];
    render(
      <LikeDislike
        followUp="always"
        location="/pricing"
        submit={async (payload) => {
          payloads.push(payload);
          if (payloads.length === 1) throw error;
        }}
        onSubmitError={(failure) => failures.push(failure)}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    assert.ok(await screen.findByText(error.message));
    assert.equal(failures[0], error);
    assert.deepEqual(payloads[0], {
      location: "/pricing",
      widgetType: "thumbs",
      value: 1,
    });
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    assert.ok(await screen.findByText("Thanks!"));
    assert.deepEqual(payloads[1], payloads[0]);
  });

  test("names the text field and caps it at the default comment limit", () => {
    render(<LikeDislike followUp="always" />);

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    const input = screen.getByRole("textbox", {
      name: "Additional feedback",
    }) as HTMLTextAreaElement;

    assert.equal(input.maxLength, 500);
  });

  test("keeps saved feedback successful when a success callback throws", async () => {
    const consoleErrors = captureConsoleErrors();
    const callbackError = new Error("host analytics failed");
    let submits = 0;
    const submitErrors: unknown[] = [];

    render(
      <LikeDislike
        followUp="always"
        submit={async () => {
          submits += 1;
        }}
        onSubmitSuccess={() => {
          throw callbackError;
        }}
        onSubmitError={(error) => submitErrors.push(error)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(screen.queryByRole("button", { name: "Try again" }), null);
    assert.equal(submits, 1);
    assert.deepEqual(submitErrors, []);
    assert.equal(consoleErrors[0]?.[1], callbackError);
  });

  test("logs a rejected async success callback instead of leaking it", async () => {
    const consoleErrors = captureConsoleErrors();
    const callbackError = new Error("async host analytics failed");
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on("unhandledRejection", onUnhandled);

    try {
      render(
        <LikeDislike
          followUp="always"
          submit={async () => {}}
          onSubmitSuccess={async () => {
            throw callbackError;
          }}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Yes" }));
      fireEvent.click(screen.getByRole("button", { name: "Send" }));

      assert.ok(await screen.findByText("Thanks!"));
      await new Promise((resolve) => setTimeout(resolve, 0));

      assert.deepEqual(unhandled, []);
      assert.equal(consoleErrors[0]?.[1], callbackError);
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
  });

  test("still submits and recovers when start and error callbacks throw", async () => {
    captureConsoleErrors();
    let attempts = 0;

    render(
      <LikeDislike
        followUp="always"
        submit={async () => {
          attempts += 1;
          if (attempts === 1) throw new Error("offline");
        }}
        onSubmitStart={() => {
          throw new Error("start callback failed");
        }}
        onSubmitError={() => {
          throw new Error("error callback failed");
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    fireEvent.click(await screen.findByRole("button", { name: "Try again" }));

    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(attempts, 2);
  });

  test("sends one payload when a custom footer submits twice in one tick", async () => {
    const payloads: WidgetPayload[] = [];

    function DoubleSubmitFooter() {
      const { submitSelected, selectedValue } = useFeedbackContext();
      if (selectedValue === null) return null;
      return (
        <button
          type="button"
          onClick={() => {
            void submitSelected();
            void submitSelected();
          }}
        >
          Send
        </button>
      );
    }

    render(
      <FeedbackWidget
        widgetType="thumbs"
        submit={async (payload) => {
          payloads.push(payload);
        }}
      >
        <FeedbackRating variant="thumbs" />
        <DoubleSubmitFooter />
      </FeedbackWidget>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Send" }));
    });

    assert.equal(payloads.length, 1);
  });

  test("keeps success visible and focuses its status after explicit send", async () => {
    render(<LikeDislike followUp="always" />);

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    const submitButton = screen.getByRole("button", { name: "Send" });
    submitButton.focus();
    fireEvent.click(submitButton);

    const successStatus = (await screen.findByText("Thanks!")).closest(
      '[role="status"]',
    );
    assert.ok(successStatus);
    assert.equal(
      successStatus.textContent,
      "Thanks!Your feedback helps us improve.",
    );
    assert.equal(document.activeElement, successStatus);

    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.ok(screen.getByText("Thanks!"));
  });

  test("does not steal focus when the user moves elsewhere during submission", async () => {
    let resolveSubmit!: () => void;
    const pendingSubmit = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    render(
      <>
        <button type="button">Outside action</button>
        <LikeDislike followUp="always" submit={() => pendingSubmit} />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    const submitButton = screen.getByRole("button", { name: "Send" });
    submitButton.focus();
    fireEvent.click(submitButton);

    assert.equal(screen.getByRole("status").textContent, "Sending feedback");
    assert.ok(submitButton.closest('[aria-busy="true"]'));

    const outsideButton = screen.getByRole("button", {
      name: "Outside action",
    });
    outsideButton.focus();
    resolveSubmit();

    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(document.activeElement, outsideButton);
  });

  test("isolates a throwing dismissal callback while closing and restoring focus", () => {
    const consoleErrors = captureConsoleErrors();
    const callbackError = new Error("dismissal analytics failed");
    let cancelled = 0;
    render(
      <LikeDislike
        followUp="always"
        closeButton
        onCancel={() => {
          cancelled += 1;
          throw callbackError;
        }}
      />,
    );
    const dismissButton = screen.getByRole("button", {
      name: "Dismiss feedback widget",
    });
    dismissButton.focus();
    fireEvent.click(dismissButton);

    assert.equal(cancelled, 1);
    assert.equal(
      document.activeElement,
      screen.getByText("Feedback widget closed"),
    );
    assert.equal(
      screen.queryByRole("button", { name: "Dismiss feedback widget" }),
      null,
    );
    assert.deepEqual(consoleErrors, [
      ["Sentimeter widget callback threw:", callbackError],
    ]);
  });

  test("isolates a rejected async dismissal callback after closing and restoring focus", async () => {
    const consoleErrors = captureConsoleErrors();
    const callbackError = new Error("async dismissal analytics failed");
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    let rejectCallback!: (reason: unknown) => void;
    const pendingCallback = new Promise<void>((_, reject) => {
      rejectCallback = reject;
    });
    let cancelled = 0;
    let submits = 0;
    process.on("unhandledRejection", onUnhandled);

    try {
      render(
        <LikeDislike
          followUp="always"
          closeButton
          submit={async () => {
            submits += 1;
          }}
          onCancel={() => {
            cancelled += 1;
            return pendingCallback;
          }}
        />,
      );
      const dismissButton = screen.getByRole("button", {
        name: "Dismiss feedback widget",
      });
      dismissButton.focus();
      fireEvent.click(dismissButton);

      const focusAnchor = screen.getByText("Feedback widget closed");
      assert.equal(document.activeElement, focusAnchor);
      assert.equal(cancelled, 1);
      assert.equal(submits, 0);
      assert.equal(
        screen.queryByRole("button", { name: "Dismiss feedback widget" }),
        null,
      );

      await act(async () => {
        rejectCallback(callbackError);
        await new Promise((resolve) => setTimeout(resolve, 20));
      });

      assert.deepEqual(unhandled, []);
      assert.deepEqual(consoleErrors, [
        ["Sentimeter widget callback threw:", callbackError],
      ]);
      assert.equal(document.activeElement, focusAnchor);
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
  });
});

describe("cancel, custom glyphs, and inline layout", () => {
  test("Cancel clears an unsent choice and comment without dismissing", () => {
    const states: string[] = [];
    let resets = 0;
    let dismissed = false;
    render(
      <EmojiFeedback
        followUp="always"
        onStateChange={(state) => states.push(state)}
        onReset={() => (resets += 1)}
        onCancel={() => (dismissed = true)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Happy (4 of 5)" }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Draft" },
    });
    const cancel = screen.getByRole("button", { name: "Cancel" });
    cancel.focus();
    fireEvent.click(cancel);

    assert.equal(resets, 1);
    assert.equal(dismissed, false);
    assert.deepEqual(states, ["selected", "idle"]);
    assert.equal(screen.queryByRole("textbox"), null);
    assert.equal(screen.queryByRole("button", { name: "Send" }), null);
    const choices = screen.getAllByRole("button", { pressed: false });
    assert.equal(document.activeElement, choices[0]);

    fireEvent.click(screen.getByRole("button", { name: "Happy (4 of 5)" }));
    assert.equal(
      (screen.getByRole("textbox") as HTMLTextAreaElement).value,
      "",
      "a cleared comment does not come back",
    );
  });

  test("hides Cancel when showCancel is false", () => {
    render(<LikeDislike followUp="always" showCancel={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    assert.equal(screen.queryByRole("button", { name: "Cancel" }), null);
    assert.ok(screen.getByRole("button", { name: "Send" }));
  });

  test("renders custom face glyphs with their own names and values", async () => {
    const payloads: WidgetPayload[] = [];
    render(
      <EmojiFeedback
        followUp="always"
        glyphs={[
          "🥶",
          { glyph: "😐", label: "Meh" },
          "🙂",
          "😀",
          { glyph: <img alt="" src="/fire.png" />, label: "On fire" },
        ]}
        submit={async (payload) => {
          payloads.push(payload);
        }}
      />,
    );

    assert.ok(screen.getByRole("button", { name: "Rating 1 of 5" }));
    assert.ok(screen.getByRole("button", { name: "Meh (2 of 5)" }));
    const best = screen.getByRole("button", { name: "On fire (5 of 5)" });
    assert.ok(best.querySelector("img"));

    fireEvent.click(best);
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(payloads[0]?.widgetType === "emoji" && payloads[0].value, 5);
  });

  test("repeats one custom star glyph and names it", () => {
    render(
      <StarRating followUp="always" glyph={{ glyph: "❤️", label: "heart" }} />,
    );
    assert.ok(screen.getByRole("button", { name: "Rate 1 heart" }));
    assert.ok(screen.getByRole("button", { name: "Rate 3 hearts" }));
    assert.equal(screen.getAllByText("❤️").length, 5);
  });

  test("custom thumbs keep like = 1 and dislike = 0", async () => {
    const payloads: WidgetPayload[] = [];
    render(
      <LikeDislike
        followUp="always"
        glyphs={[
          { glyph: "🔥", label: "Love it" },
          { glyph: "🧊", label: "Not for me" },
        ]}
        submit={async (payload) => {
          payloads.push(payload);
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Not for me" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(payloads[0]?.widgetType === "thumbs" && payloads[0].value, 0);
  });

  test("falls back to the built-in set and warns when the glyph count is wrong", () => {
    const warnings: unknown[][] = [];
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => warnings.push(args);
    try {
      render(
        <FeedbackWidget widgetType="emoji">
          <FeedbackRating variant="emoji" glyphs={["🙂", "😀"]} />
        </FeedbackWidget>,
      );
    } finally {
      console.warn = originalWarn;
    }
    assert.equal(screen.getAllByRole("button").length, 5);
    assert.ok(screen.getByRole("button", { name: "Angry (1 of 5)" }));
    assert.match(String(warnings[0]?.[0]), /take 5 glyphs, received 2/);
  });

  test("inline layout opens after a choice, resets with Cancel, and hides the field when done", async () => {
    render(
      <EmojiFeedback
        layout="inline"
        title="Was this helpful?"
        description="Not shown inline"
        followUp="always"
      />,
    );

    const root = document.querySelector('[data-slot="feedback-widget"]');
    assert.ok(screen.getByText("Was this helpful?"));
    assert.equal(screen.queryByText("Not shown inline"), null);

    fireEvent.click(screen.getByRole("button", { name: "Happy (4 of 5)" }));
    assert.ok(screen.getByRole("textbox"));
    assert.ok(
      screen.getByText("Optional"),
      "the inline footer hints that the comment is optional",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    assert.equal(screen.queryByRole("textbox"), null);
    assert.equal(root?.getAttribute("data-state"), "idle");

    fireEvent.click(screen.getByRole("button", { name: "Happy (4 of 5)" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    assert.ok(await screen.findByText("Thanks!"));
    assert.equal(root?.getAttribute("data-state"), "done");
  });

  test("inline faces are line icons while the stacked card keeps emoji", () => {
    render(<EmojiFeedback layout="inline" />);
    const inlineFace = screen.getByRole("button", { name: "Sad (2 of 5)" });
    assert.ok(inlineFace.querySelector("svg"));
    assert.equal(inlineFace.textContent, "");
    cleanup();
    render(<EmojiFeedback />);
    assert.equal(
      screen.getByRole("button", { name: "Sad (2 of 5)" }).textContent,
      "😕",
    );
  });

  test("inline keeps one action while sending and after an error", async () => {
    let fail: (error: Error) => void = () => {};
    render(
      <LikeDislike
        layout="inline"
        followUp="always"
        submit={() =>
          new Promise<void>((_, reject) => {
            fail = reject;
          })
        }
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "No" }));
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    assert.ok(screen.getByText("Sending…"));
    assert.equal(screen.queryByRole("button", { name: "Cancel" }), null);

    await act(async () => fail(new Error("offline")));
    assert.ok(screen.getByRole("button", { name: "Try again" }));
    assert.equal(screen.queryByRole("button", { name: "Cancel" }), null);
  });

  test("stacked widgets group the rating and comment in one response well", () => {
    render(<StarRating followUp="always" />);
    fireEvent.click(screen.getByRole("button", { name: "Rate 4 stars" }));
    const well = document.querySelector('[data-slot="feedback-response"]');
    assert.ok(well?.querySelector('[data-slot="feedback-rating"]'));
    assert.ok(well?.querySelector("textarea"));
    cleanup();
    render(<StarRating layout="inline" followUp="always" />);
    assert.equal(
      document.querySelector('[data-slot="feedback-response"]'),
      null,
    );
  });
});
