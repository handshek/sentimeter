import assert from "node:assert/strict";
import { afterEach, describe, test } from "node:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { readSelection, SelectionFeedback, type WidgetPayload } from "./index";
import { placeNear, SELECTION_QUOTE_MAX_LENGTH } from "./selection-feedback";

afterEach(() => {
  document.getSelection()?.removeAllRanges();
  cleanup();
  document.body.innerHTML = "";
});

function setup(html: string) {
  document.body.innerHTML = html;
  return document.querySelector<HTMLElement>("#doc")!;
}

function select(
  start: Node,
  startOffset: number,
  end: Node,
  endOffset: number,
) {
  const range = document.createRange();
  range.setStart(start, startOffset);
  range.setEnd(end, endOffset);
  const selection = document.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

function selectContents(node: Node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const selection = document.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

describe("readSelection edge cases", () => {
  test("returns the normalised quote for a selection inside the content", () => {
    const doc = setup(
      '<div id="doc"><p id="p">Install   the\n  widget</p></div>',
    );
    const read = readSelection(doc, selectContents(doc.querySelector("#p")!));
    assert.equal(read?.quote, "Install the widget");
  });

  test("no selection, no ranges, and a collapsed caret give nothing", () => {
    const doc = setup('<div id="doc"><p id="p">Text</p></div>');
    assert.equal(readSelection(doc, null), null);
    document.getSelection()!.removeAllRanges();
    assert.equal(readSelection(doc, document.getSelection()), null);
    const text = doc.querySelector("#p")!.firstChild!;
    assert.equal(readSelection(doc, select(text, 2, text, 2)), null);
  });

  test("a selection outside the content is ignored", () => {
    const doc = setup('<div id="doc"><p>In</p></div><p id="out">Outside</p>');
    assert.equal(
      readSelection(doc, selectContents(document.querySelector("#out")!)),
      null,
    );
  });

  test("a selection crossing the content boundary is ignored", () => {
    const doc = setup(
      '<div id="doc"><p id="in">Inside</p></div><p id="out">Outside</p>',
    );
    const inside = doc.querySelector("#in")!.firstChild!;
    const outside = document.querySelector("#out")!.firstChild!;
    assert.equal(readSelection(doc, select(inside, 2, outside, 3)), null);
  });

  test("whitespace-only selections are ignored", () => {
    const doc = setup('<div id="doc"><p id="p">   \n  </p></div>');
    assert.equal(
      readSelection(doc, selectContents(doc.querySelector("#p")!)),
      null,
    );
  });

  test("selections in fields, editable regions, or the widget itself are ignored", () => {
    const doc = setup(
      '<div id="doc"><div contenteditable="true"><p id="edit">Draft</p></div><div data-slot="feedback-widget"><p id="own">Quote</p></div><p id="ok">Fine</p></div>',
    );
    assert.equal(
      readSelection(doc, selectContents(doc.querySelector("#edit")!)),
      null,
    );
    assert.equal(
      readSelection(doc, selectContents(doc.querySelector("#own")!)),
      null,
    );
    assert.ok(readSelection(doc, selectContents(doc.querySelector("#ok")!)));
  });

  test("long quotes are capped with an ellipsis", () => {
    const doc = setup(
      `<div id="doc"><p id="p">${"word ".repeat(400)}</p></div>`,
    );
    const read = readSelection(doc, selectContents(doc.querySelector("#p")!));
    assert.equal(read?.quote.length, SELECTION_QUOTE_MAX_LENGTH);
    assert.ok(read?.quote.endsWith("…"));
  });
});

describe("placeNear", () => {
  const viewport = { width: 400, height: 800 };
  const size = { width: 200, height: 40 };
  test("sits above and centred on the selection", () => {
    assert.deepEqual(
      placeNear(
        { top: 300, bottom: 320, left: 100, width: 100 },
        size,
        viewport,
      ),
      {
        top: 252,
        left: 50,
      },
    );
  });
  test("flips below near the top and clamps to the viewport edges", () => {
    assert.deepEqual(
      placeNear({ top: 20, bottom: 40, left: 380, width: 10 }, size, viewport),
      {
        top: 48,
        left: 192,
      },
    );
    assert.equal(
      placeNear({ top: 300, bottom: 320, left: 0, width: 10 }, size, viewport)
        .left,
      8,
    );
  });
  test("prefers below on touch screens when it fits", () => {
    assert.equal(
      placeNear(
        { top: 300, bottom: 320, left: 100, width: 100 },
        size,
        viewport,
        true,
      ).top,
      328,
    );
  });
});

test("selecting text shows the toolbar, and a suggestion sends the quote", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <SelectionFeedback
      location="/docs"
      submit={async (payload) => {
        payloads.push(payload);
      }}
    >
      <p>Run the install command first.</p>
    </SelectionFeedback>,
  );
  await act(async () => {
    selectContents(screen.getByText("Run the install command first."));
    document.dispatchEvent(new Event("selectionchange"));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
  const toolbar = screen.getByRole("toolbar", {
    name: "Feedback on selection",
  });
  assert.ok(toolbar);
  fireEvent.click(screen.getByRole("button", { name: "Suggest edit" }));
  const box = screen.getByRole("textbox");
  assert.equal(document.activeElement, box);
  assert.equal(
    (screen.getByRole("button", { name: "Send" }) as HTMLButtonElement)
      .disabled,
    true,
    "an edit needs a suggestion",
  );
  fireEvent.change(box, { target: { value: "Run it from the repo root." } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Thanks. We'll take a look.");
  assert.deepEqual(payloads, [
    {
      location: "/docs",
      widgetType: "selection",
      kind: "edit",
      quote: "Run the install command first.",
      text: "Run it from the repo root.",
    },
  ]);
});

test("Escape and Cancel close; a report may be sent without a note", async () => {
  const payloads: WidgetPayload[] = [];
  render(
    <SelectionFeedback
      submit={async (payload) => {
        payloads.push(payload);
      }}
    >
      <p>Unsafe advice here.</p>
    </SelectionFeedback>,
  );
  const show = async () =>
    act(async () => {
      selectContents(screen.getByText("Unsafe advice here."));
      document.dispatchEvent(new Event("selectionchange"));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
  await show();
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(screen.queryByRole("toolbar"), null);

  await show();
  fireEvent.click(screen.getByRole("button", { name: "Report" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  assert.equal(screen.queryByRole("dialog"), null);

  await show();
  fireEvent.click(screen.getByRole("button", { name: "Report" }));
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  await screen.findByText("Thanks. We'll take a look.");
  assert.deepEqual(payloads, [
    {
      location: "/",
      widgetType: "selection",
      kind: "report",
      quote: "Unsafe advice here.",
    },
  ]);
});
