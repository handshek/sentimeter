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

  test("retains edits and the save lock while a request is pending", () => {
    const submitted = "https://first.example.com/";
    const saving = allowedOriginsDraftReducer(
      allowedOriginsDraftReducer(hydratedDraft(), {
        type: "edit",
        value: submitted,
      }),
      { type: "save-start" },
    );
    const edited = allowedOriginsDraftReducer(saving, {
      type: "edit",
      value: "https://second.example.com",
    });
    const refreshed = allowedOriginsDraftReducer(edited, {
      type: "hydrate",
      value: "https://first.example.com",
    });
    const completed = allowedOriginsDraftReducer(refreshed, {
      type: "save-success",
      value: "https://first.example.com",
    });

    assert.equal(edited.status, "saving");
    assert.equal(refreshed.status, "saving");
    assert.equal(completed.value, "https://second.example.com");
    assert.equal(completed.savedValue, "https://first.example.com");
    assert.equal(completed.status, "idle");
    assert.equal(hasUnsavedAllowedOrigins(completed), true);
  });

  test("keeps a later edit to the old baseline through pending hydration", () => {
    const saving = allowedOriginsDraftReducer(
      allowedOriginsDraftReducer(hydratedDraft(), {
        type: "edit",
        value: "https://first.example.com",
      }),
      { type: "save-start" },
    );
    const reverted = allowedOriginsDraftReducer(saving, {
      type: "edit",
      value: saved,
    });
    const refreshed = allowedOriginsDraftReducer(reverted, {
      type: "hydrate",
      value: "https://first.example.com",
    });
    const completed = allowedOriginsDraftReducer(refreshed, {
      type: "save-success",
      value: "https://first.example.com",
    });

    assert.equal(refreshed.value, saved);
    assert.equal(refreshed.status, "saving");
    assert.equal(completed.value, saved);
    assert.equal(hasUnsavedAllowedOrigins(completed), true);
  });

  test("discarding during a save follows its eventual saved result", () => {
    const saving = allowedOriginsDraftReducer(
      allowedOriginsDraftReducer(hydratedDraft(), {
        type: "edit",
        value: "https://first.example.com/",
      }),
      { type: "save-start" },
    );
    const discarded = allowedOriginsDraftReducer(saving, { type: "discard" });
    const completed = allowedOriginsDraftReducer(discarded, {
      type: "save-success",
      value: "https://first.example.com",
    });

    assert.equal(discarded.value, saved);
    assert.equal(discarded.status, "saving");
    assert.equal(completed.value, "https://first.example.com");
    assert.equal(completed.status, "saved");
    assert.equal(hasUnsavedAllowedOrigins(completed), false);
  });

  test("an edit after pending discard is preserved when the save completes", () => {
    const saving = allowedOriginsDraftReducer(
      allowedOriginsDraftReducer(hydratedDraft(), {
        type: "edit",
        value: "https://first.example.com",
      }),
      { type: "save-start" },
    );
    const edited = allowedOriginsDraftReducer(
      allowedOriginsDraftReducer(saving, { type: "discard" }),
      { type: "edit", value: "https://later.example.com" },
    );
    const completed = allowedOriginsDraftReducer(edited, {
      type: "save-success",
      value: "https://first.example.com",
    });

    assert.equal(completed.value, "https://later.example.com");
    assert.equal(hasUnsavedAllowedOrigins(completed), true);
  });
});
