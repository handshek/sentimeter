import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as widgetExports from "./index";
import { FeedbackWidget, LikeDislike } from "./index";

describe("canonical widget feedback system", () => {
  test("maps thumbs values to their canonical labels and emoji", () => {
    const markup = renderToStaticMarkup(<LikeDislike variant="emoji" />);
    const dislikeButton = markup.match(
      /<button[^>]*aria-label="Dislike"[^>]*>.*?<\/button>/,
    )?.[0];
    const likeButton = markup.match(
      /<button[^>]*aria-label="Like"[^>]*>.*?<\/button>/,
    )?.[0];

    assert.match(dislikeButton ?? "", /👎/);
    assert.match(likeButton ?? "", /👍/);

    const iconMarkup = renderToStaticMarkup(<LikeDislike />);
    assert.ok(
      iconMarkup.indexOf('aria-label="Like"') <
        iconMarkup.indexOf('aria-label="Dislike"'),
      "icon mode keeps the existing Like then Dislike order",
    );
  });

  test("lets consumer classes override default container classes", () => {
    const markup = renderToStaticMarkup(
      <FeedbackWidget widgetType="emoji" className="max-w-none p-2">
        Feedback
      </FeedbackWidget>,
    );

    assert.match(markup, /max-w-none/);
    assert.match(markup, /p-2/);
    assert.doesNotMatch(markup, /max-w-\[400px\]/);
    assert.doesNotMatch(markup, /p-6/);
  });

  test("publishes only the supported root package entry point and exports", () => {
    const packageJson = JSON.parse(
      readFileSync(join(__dirname, "../package.json"), "utf8"),
    ) as { exports: Record<string, string> };

    assert.deepEqual(packageJson.exports, { ".": "./src/index.ts" });
    assert.deepEqual(Object.keys(widgetExports).sort(), [
      "DEFAULT_FEEDBACK_ENDPOINT",
      "EmojiFeedback",
      "FeedbackDescription",
      "FeedbackFooter",
      "FeedbackInput",
      "FeedbackRating",
      "FeedbackTitle",
      "FeedbackWidget",
      "LikeDislike",
      "StarRating",
      "submitFeedback",
      "useFeedbackContext",
    ]);
  });
});
