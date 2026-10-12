import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
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

afterEach(cleanup);

const widgetCases = [
  {
    name: "emoji symbols",
    Widget: EmojiFeedback,
    variant: "emoji",
    ratingName: "Rating 5 of 5",
    alternateName: "Rating 1 of 5",
    widgetType: "emoji",
    value: 5,
    alternateValue: 1,
  },
  {
    name: "emoji icons",
    Widget: EmojiFeedback,
    variant: "icons",
    ratingName: "Delighted (5 of 5)",
    alternateName: "Angry (1 of 5)",
    widgetType: "emoji",
    value: 5,
    alternateValue: 1,
  },
  {
    name: "thumb icons",
    Widget: LikeDislike,
    variant: "icons",
    ratingName: "Like",
    alternateName: "Dislike",
    widgetType: "thumbs",
    value: 1,
    alternateValue: 0,
  },
  {
    name: "thumb emoji",
    Widget: LikeDislike,
    variant: "emoji",
    ratingName: "Like",
    alternateName: "Dislike",
    widgetType: "thumbs",
    value: 1,
    alternateValue: 0,
  },
  {
    name: "star icons",
    Widget: StarRating,
    variant: "icons",
    ratingName: "Rate 5 stars",
    alternateName: "Rate 1 star",
    widgetType: "star",
    value: 5,
    alternateValue: 1,
  },
  {
    name: "star emoji",
    Widget: StarRating,
    variant: "emoji",
    ratingName: "Rate 5 stars",
    alternateName: "Rate 1 star",
    widgetType: "star",
    value: 5,
    alternateValue: 1,
  },
] as const;

for (const {
  name,
  Widget,
  variant,
  ratingName,
  alternateName,
  widgetType,
  value,
  alternateValue,
} of widgetCases) {
  test(`${name} locks submitted feedback until the widget is reset`, async () => {
    const payloads: WidgetPayload[] = [];
    let resolveSubmit!: () => void;
    const pendingSubmit = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    const { container, rerender } = render(
      <Widget
        key="original"
        variant={variant}
        showInput
        autoHide={false}
        submit={(payload) => {
          payloads.push(payload);
          return pendingSubmit;
        }}
      />,
    );
    const controls = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button[aria-pressed]"),
    );
    assert.equal(
      controls.every((control) => !control.disabled),
      true,
    );

    fireEvent.click(screen.getByRole("button", { name: ratingName }));
    const input = screen.getByRole("textbox", {
      name: "Additional feedback",
    }) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "Original feedback" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    assert.equal(input.disabled, true);
    assert.equal(
      controls.every((control) => control.disabled),
      true,
    );

    await act(async () => resolveSubmit());
    assert.equal(screen.getByRole("status").textContent, "Thanks!");
    assert.equal(input.disabled, true);
    assert.equal(
      controls.every((control) => control.disabled),
      true,
    );
    fireEvent.click(screen.getByRole("button", { name: alternateName }));
    assert.equal(
      screen
        .getByRole("button", { name: ratingName })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(input.value, "Original feedback");
    assert.equal(screen.queryByRole("button", { name: "Submit" }), null);
    assert.deepEqual(payloads, [
      {
        apiKey: "",
        location: "/",
        widgetType,
        value,
        text: "Original feedback",
      },
    ]);

    rerender(
      <Widget key="reset" variant={variant} showInput autoHide={false} />,
    );
    assert.equal(screen.queryByRole("status"), null);
    assert.equal(screen.queryByRole("textbox"), null);
    const resetControl = screen.getByRole("button", {
      name: alternateName,
    }) as HTMLButtonElement;
    assert.equal(resetControl.disabled, false);
    fireEvent.click(resetControl);
    const resetInput = screen.getByRole("textbox", {
      name: "Additional feedback",
    }) as HTMLTextAreaElement;
    assert.equal(resetInput.disabled, false);
    assert.equal(resetInput.value, "");
    assert.equal(resetControl.getAttribute("aria-pressed"), "true");
  });

  test(`${name} permits corrections after a failed submission`, async () => {
    const payloads: WidgetPayload[] = [];
    const { container } = render(
      <Widget
        variant={variant}
        showInput
        autoHide={false}
        submit={async (payload) => {
          payloads.push(payload);
          if (payloads.length === 1) throw new Error("offline");
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: ratingName }));
    const input = screen.getByRole("textbox", {
      name: "Additional feedback",
    }) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "Original feedback" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByRole("button", { name: "Try Again" });
    assert.equal(input.disabled, false);
    assert.equal(
      Array.from(
        container.querySelectorAll<HTMLButtonElement>("button[aria-pressed]"),
      ).every((control) => !control.disabled),
      true,
    );
    fireEvent.change(input, { target: { value: "Corrected feedback" } });
    fireEvent.click(screen.getByRole("button", { name: alternateName }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await screen.findByText("Thanks!");
    assert.deepEqual(payloads, [
      {
        apiKey: "",
        location: "/",
        widgetType,
        value,
        text: "Original feedback",
      },
      {
        apiKey: "",
        location: "/",
        widgetType,
        value: alternateValue,
        text: "Corrected feedback",
      },
    ]);
    assert.equal(input.value, "Corrected feedback");
    assert.equal(input.disabled, true);
  });
}

for (const variant of ["icons", "emoji"] as const) {
  test(`${variant} stars retain the submitted fill while locked despite hover or focus previews`, async () => {
    let resolveSubmit!: () => void;
    const pendingSubmit = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    const { container } = render(
      <StarRating
        variant={variant}
        autoHide={false}
        submit={() => pendingSubmit}
      />,
    );
    const filledStars = () =>
      container.querySelectorAll(
        variant === "icons"
          ? 'svg[fill="currentColor"]'
          : "button[aria-pressed] span.grayscale-0",
      ).length;
    const firstStar = screen.getByRole("button", { name: "Rate 1 star" });
    const fifthStar = screen.getByRole("button", { name: "Rate 5 stars" });
    fireEvent.click(fifthStar);
    assert.equal(filledStars(), 5);
    fireEvent.mouseEnter(firstStar);
    assert.equal(filledStars(), 1);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    assert.equal(filledStars(), 5);
    await act(async () => resolveSubmit());
    assert.equal(screen.getByRole("status").textContent, "Thanks!");
    assert.equal(filledStars(), 5);
    fireEvent.mouseLeave(firstStar);
    fireEvent.mouseEnter(firstStar);
    fireEvent.focus(firstStar);
    fireEvent.click(firstStar);
    assert.equal(filledStars(), 5);
    assert.equal(fifthStar.getAttribute("aria-pressed"), "true");
  });
}
