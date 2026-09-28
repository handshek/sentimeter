import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  DEFAULT_PROJECT_VIEW_QUERY,
  parseProjectViewQuery,
  updateProjectViewQuery,
} from "./project-view-query";

describe("project dashboard view query", () => {
  test("restores every supported filter from a shared URL", () => {
    const view = parseProjectViewQuery(
      new URLSearchParams(
        "range=30d&widget=star&sentiment=negative&q=checkout+flow&chart=line",
      ),
    );

    assert.deepEqual(view, {
      range: "30d",
      widget: "star",
      sentiment: "negative",
      search: "checkout flow",
      chart: "line",
    });
  });

  test("falls back safely when enum values are invalid", () => {
    const view = parseProjectViewQuery(
      new URLSearchParams(
        "range=year&widget=nps&sentiment=mixed&q=&chart=pie",
      ),
    );

    assert.deepEqual(view, DEFAULT_PROJECT_VIEW_QUERY);
  });

  test("updates selected filters while preserving unrelated parameters", () => {
    const query = updateProjectViewQuery(
      new URLSearchParams("projectId=project-123&utm_source=docs"),
      {
        range: "24h",
        widget: "emoji",
        sentiment: "positive",
        search: "pricing page",
        chart: "area",
      },
    );

    assert.equal(
      query,
      "projectId=project-123&utm_source=docs&range=24h&widget=emoji&sentiment=positive&q=pricing+page&chart=area",
    );
  });

  test("removes defaults without disturbing unrelated parameters", () => {
    const query = updateProjectViewQuery(
      new URLSearchParams(
        "range=24h&widget=emoji&sentiment=positive&q=pricing&chart=area&utm_source=docs",
      ),
      DEFAULT_PROJECT_VIEW_QUERY,
    );

    assert.equal(query, "utm_source=docs");
  });
});
