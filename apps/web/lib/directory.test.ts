import { expect, test } from "bun:test";
import { directory, entriesFor } from "./directory";

test("the homepage groups every component and block by situation", () => {
  expect(entriesFor("When something breaks").map((e) => e.name)).toEqual([
    "Feedback Form",
    "Floating feedback button",
    "Report a problem",
    "Error page",
  ]);
  expect(entriesFor("After something works")).toHaveLength(6);
  expect(entriesFor("When someone leaves").map((e) => e.href)).toEqual([
    "/components/survey",
    "/components/blocks/cancel-flow-survey",
  ]);
  expect(directory).toHaveLength(12);
});
