import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { copyText } from "../../_lib/clipboard";
import {
  createWidgetRigState,
  getProjectDashboardHref,
  widgetRigReducer,
} from "./widgets-playground-behavior";

describe("widgets playground behavior", () => {
  const dirtyRigState = {
    ...createWidgetRigState(),
    state: "selected" as const,
    selectedValue: 5,
    lastPayload: {
      apiKey: "pk_test",
      location: "/pricing",
      widgetType: "star" as const,
      value: 5,
    },
    lastResult: { ok: true, status: 200, at: 123 },
    instance: 3,
  };

  test("reset widget remounts the widget and clears its diagnostics", () => {
    assert.deepEqual(
      widgetRigReducer(dirtyRigState, { type: "reset-widget" }),
      createWidgetRigState(4),
    );
  });

  test("clear debug also resets the visible widget so state cannot disagree", () => {
    assert.deepEqual(
      widgetRigReducer(dirtyRigState, { type: "clear-debug" }),
      createWidgetRigState(4),
    );
  });

  test("ignores a late result from a widget that was already reset", () => {
    const resetState = createWidgetRigState(4);

    assert.equal(
      widgetRigReducer(resetState, {
        type: "submit-result",
        instance: 3,
        result: { ok: false, status: 0, error: "late", at: 456 },
      }),
      resetState,
    );
  });

  test("copies a project key and returns an announced success state", async () => {
    let copiedValue = "";

    const result = await copyText("pk_project", {
      writeText: async (value) => {
        copiedValue = value;
      },
    });

    assert.equal(result, "copied");
    assert.equal(copiedValue, "pk_project");
  });

  test("returns an inline manual-copy state when clipboard access fails", async () => {
    const result = await copyText("pk_project", {
      writeText: async () => {
        throw new Error("clipboard unavailable");
      },
    });

    assert.equal(result, "manual");
  });

  test("does not create dashboard navigation without a selected project", () => {
    assert.equal(getProjectDashboardHref(""), null);
    assert.equal(getProjectDashboardHref("   "), null);
    assert.equal(
      getProjectDashboardHref("project-123"),
      "/dashboard/projects/project-123",
    );
  });
});
