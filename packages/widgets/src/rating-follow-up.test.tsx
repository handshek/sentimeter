import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
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
  NpsScore,
  StarRating,
  type WidgetPayload,
} from "./index";

afterEach(cleanup);

const ratings = [
  {
    name: "emoji",
    Widget: EmojiFeedback,
    negative: "Sad (2 of 5)",
    positive: "Neutral (3 of 5)",
    value: 2,
    positiveValue: 3,
    widgetType: "emoji",
    layout: "stacked",
  },
  {
    name: "thumbs",
    Widget: LikeDislike,
    negative: "Dislike",
    positive: "Like",
    value: 0,
    positiveValue: 1,
    widgetType: "thumbs",
    layout: "inline",
  },
  {
    name: "stars",
    Widget: StarRating,
    negative: "Rate 2 stars",
    positive: "Rate 3 stars",
    value: 2,
    positiveValue: 3,
    widgetType: "star",
    layout: "stacked",
  },
] as const;

for (const rating of ratings) {
  test(`${rating.name} asks why after a negative pick and sends the optional text`, async () => {
    const payloads: WidgetPayload[] = [];
    render(
      <rating.Widget
        layout={rating.layout}
        location="/checkout"
        submit={async (payload) => {
          payloads.push(payload);
        }}
      />,
    );
    assert.equal(screen.queryByRole("textbox"), null);
    fireEvent.click(screen.getByRole("button", { name: rating.negative }));
    assert.deepEqual(payloads, []);
    const input = screen.getByRole("textbox", { name: "Additional feedback" });
    assert.equal(
      input.getAttribute("placeholder"),
      "What went wrong? (optional)",
    );
    assert.ok(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.change(input, { target: { value: "Checkout failed" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("Thanks!");
    assert.deepEqual(payloads, [
      {
        location: "/checkout",
        widgetType: rating.widgetType,
        value: rating.value,
        text: "Checkout failed",
      },
    ]);
    assert.equal(screen.queryByRole("textbox"), null);
  });

  test(`${rating.name} submits a nonnegative pick immediately`, async () => {
    const payloads: WidgetPayload[] = [];
    render(
      <rating.Widget
        submit={async (payload) => {
          payloads.push(payload);
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: rating.positive }));
    assert.equal(screen.queryByRole("textbox"), null);
    await screen.findByText("Thanks!");
    assert.deepEqual(payloads, [
      {
        location: "/",
        widgetType: rating.widgetType,
        value: rating.positiveValue,
      },
    ]);
    assert.equal(screen.queryByRole("button", { name: "Send" }), null);
  });
}

test("never follows up even after a negative pick", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <LikeDislike
      followUp="never"
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Dislike" }));
  await screen.findByText("Thanks!");
  assert.equal(screen.queryByRole("textbox"), null);
  assert.deepEqual(payloads, [
    { location: "/", widgetType: "thumbs", value: 0 },
  ]);
});

test("changing a negative draft to a positive pick omits its unsent comment", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <LikeDislike
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Dislike" }));
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "An abandoned explanation" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Like" }));
  await screen.findByText("Thanks!");
  assert.deepEqual(payloads, [
    { location: "/", widgetType: "thumbs", value: 1 },
  ]);
});

test("repeated immediate picks in one tick send only the first payload", async () => {
  const payloads: WidgetPayload[] = [];
  let complete!: () => void;
  const pending = new Promise<void>((resolve) => {
    complete = resolve;
  });
  render(
    <EmojiFeedback
      submit={(payload) => {
        payloads.push(payload);
        return pending;
      }}
    />,
  );
  const first = screen.getByRole("button", { name: "Delighted (5 of 5)" });
  const second = screen.getByRole("button", { name: "Happy (4 of 5)" });
  act(() => {
    fireEvent.click(first);
    fireEvent.click(second);
  });
  assert.deepEqual(payloads, [
    { location: "/", widgetType: "emoji", value: 5 },
  ]);
  await act(async () => complete());
  assert.equal(screen.getByRole("status").textContent, "Thanks!");
});

test("an immediate submission can retry its retained rating after failure", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <NpsScore
      submit={async (payload) => {
        payloads.push(payload);
        if (payloads.length === 1) throw new Error("offline");
      }}
    />,
  );
  const score = screen.getByRole("button", { name: "Score 7 of 10" });
  fireEvent.click(score);
  const retry = await screen.findByRole("button", { name: "Try again" });
  assert.equal(score.getAttribute("aria-pressed"), "true");
  assert.equal(screen.queryByRole("textbox"), null);
  fireEvent.click(retry);
  await screen.findByText("Thanks!");
  assert.deepEqual(payloads, [
    { location: "/", widgetType: "nps", value: 7 },
    { location: "/", widgetType: "nps", value: 7 },
  ]);
});

test("an immediate inline submission focuses its confirmation", async () => {
  render(<LikeDislike layout="inline" />);
  const like = screen.getByRole("button", { name: "Like" });
  act(() => like.focus());
  fireEvent.click(like);
  await screen.findByText("Thanks!");
  assert.equal(document.activeElement, screen.getByRole("status"));
});

test("immediate completion preserves focus moved outside while pending", async () => {
  let complete!: () => void;
  const pending = new Promise<void>((resolve) => {
    complete = resolve;
  });
  render(
    <>
      <button type="button">Continue browsing</button>
      <LikeDislike layout="inline" submit={() => pending} />
    </>,
  );
  const like = screen.getByRole("button", { name: "Like" });
  act(() => like.focus());
  fireEvent.click(like);
  const outside = screen.getByRole("button", { name: "Continue browsing" });
  act(() => outside.focus());
  await act(async () => complete());
  assert.equal(screen.getByRole("status").textContent, "Thanks!");
  assert.equal(document.activeElement, outside);
});

test("emoji arrows focus an adjacent rating without submitting before activation", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <EmojiFeedback
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  const first = screen.getByRole("button", { name: "Angry (1 of 5)" });
  const second = screen.getByRole("button", { name: "Sad (2 of 5)" });
  const last = screen.getByRole("button", { name: "Delighted (5 of 5)" });
  act(() => first.focus());
  fireEvent.keyDown(first, { key: "ArrowRight" });
  assert.equal(document.activeElement, second);
  assert.deepEqual(payloads, []);
  fireEvent.keyDown(second, { key: "End" });
  assert.equal(document.activeElement, last);
  fireEvent.click(last);
  await screen.findByText("Thanks!");
  assert.deepEqual(payloads, [
    { location: "/", widgetType: "emoji", value: 5 },
  ]);
});

test("the default thank-you remains visible beyond the former dismissal delay", async () => {
  render(
    <FeedbackWidget widgetType="thumbs">
      <FeedbackRating variant="thumbs" />
      <FeedbackFooter />
    </FeedbackWidget>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Like" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  await screen.findByText("Thanks!");
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2100));
  });
  assert.equal(screen.getByRole("status").textContent, "Thanks!");
});

test("NPS zero opens the follow-up and sends its score and text", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <NpsScore
      location="/account"
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  const scale = screen.getByRole("group", { name: "Recommendation score" });
  assert.equal(within(scale).getAllByRole("button").length, 11);
  assert.ok(screen.getByText("Not likely"));
  assert.ok(screen.getByText("Very likely"));
  fireEvent.click(within(scale).getByRole("button", { name: "Score 0 of 10" }));
  const input = screen.getByPlaceholderText(
    "What would make it better? (optional)",
  );
  assert.deepEqual(payloads, []);
  fireEvent.change(input, { target: { value: "A working export" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Thanks!");
  assert.deepEqual(payloads, [
    {
      location: "/account",
      widgetType: "nps",
      value: 0,
      text: "A working export",
    },
  ]);
});

test("NPS six still asks why and allows an empty comment inline", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <NpsScore
      layout="inline"
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Score 6 of 10" }));
  assert.ok(screen.getByRole("textbox"));
  assert.deepEqual(payloads, []);
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Thanks!");
  assert.deepEqual(payloads, [{ location: "/", widgetType: "nps", value: 6 }]);
});

for (const score of [7, 10]) {
  test(`NPS ${score} submits immediately`, async () => {
    const payloads: WidgetPayload[] = [];
    render(
      <NpsScore
        submit={async (payload) => {
          payloads.push(payload);
        }}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: `Score ${score} of 10` }),
    );
    await screen.findByText("Thanks!");
    assert.equal(screen.queryByRole("textbox"), null);
    assert.deepEqual(payloads, [
      { location: "/", widgetType: "nps", value: score },
    ]);
  });
}

test("NPS arrow keys and endpoints focus scores for keyboard activation", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <NpsScore
      submit={async (payload) => {
        payloads.push(payload);
      }}
    />,
  );
  const zero = screen.getByRole("button", { name: "Score 0 of 10" });
  const one = screen.getByRole("button", { name: "Score 1 of 10" });
  const ten = screen.getByRole("button", { name: "Score 10 of 10" });
  act(() => zero.focus());
  fireEvent.keyDown(zero, { key: "ArrowRight" });
  assert.equal(document.activeElement, one);
  fireEvent.keyDown(one, { key: "End" });
  assert.equal(document.activeElement, ten);
  fireEvent.keyDown(ten, { key: "Home" });
  assert.equal(document.activeElement, zero);
  fireEvent.keyDown(zero, { key: "ArrowLeft" });
  assert.equal(document.activeElement, ten);
  assert.deepEqual(
    payloads,
    [],
    "navigation does not submit before activation",
  );
  fireEvent.click(ten);
  await screen.findByText("Thanks!");
  assert.deepEqual(payloads, [{ location: "/", widgetType: "nps", value: 10 }]);
});

test("a rating submit handler reads the score straight from its payload", async () => {
  const scores: number[] = [];
  render(
    <NpsScore
      submit={async (payload) => {
        scores.push(payload.value);
      }}
    />,
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Score 9 of 10" }));
  });
  assert.deepEqual(scores, [9]);
});
