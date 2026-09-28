import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  allowedOriginsDraftReducer,
  createAllowedOriginsDraft,
  hasUnsavedAllowedOrigins,
} from "./project-settings-state";

describe("allowed origins draft", () => {
  const saved = "https://app.example.com";

  function hydratedDraft() {
    return allowedOriginsDraftReducer(createAllowedOriginsDraft(), {
      type: "hydrate",
      value: saved,
    });
  }

  test("tracks edits as dirty and discards back to the saved value", () => {
    const edited = allowedOriginsDraftReducer(hydratedDraft(), {
      type: "edit",
      value: `${saved}\nhttps://staging.example.com`,
    });

    assert.equal(hasUnsavedAllowedOrigins(edited), true);
    assert.equal(
      allowedOriginsDraftReducer(edited, { type: "discard" }).value,
      saved,
    );
  });

  test("preserves dirty input when live project data refreshes", () => {
    const edited = allowedOriginsDraftReducer(hydratedDraft(), {
      type: "edit",
      value: "https://draft.example.com",
    });

    const refreshed = allowedOriginsDraftReducer(edited, {
      type: "hydrate",
      value: "https://remote.example.com",
    });

    assert.equal(refreshed.value, "https://draft.example.com");
    assert.equal(refreshed.savedValue, "https://remote.example.com");
    assert.equal(hasUnsavedAllowedOrigins(refreshed), true);
  });

  test("preserves input and its dirty state after a failed save", () => {
    const edited = allowedOriginsDraftReducer(hydratedDraft(), {
      type: "edit",
      value: "https://draft.example.com",
    });
    const failed = allowedOriginsDraftReducer(edited, {
      type: "save-error",
      message: "Could not save allowed origins.",
    });

    assert.equal(failed.value, "https://draft.example.com");
    assert.equal(failed.status, "error");
    assert.equal(hasUnsavedAllowedOrigins(failed), true);
  });

  test("uses the server-normalized value as the new clean baseline", () => {
    const savedDraft = allowedOriginsDraftReducer(hydratedDraft(), {
      type: "save-success",
      value: "https://app.example.com\nhttps://staging.example.com",
    });

    assert.equal(savedDraft.status, "saved");
    assert.equal(hasUnsavedAllowedOrigins(savedDraft), false);
  });
});
