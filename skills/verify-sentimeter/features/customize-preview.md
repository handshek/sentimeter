# Customize preview

Below each live demo, a "Customize Preview" disclosure lets a user switch the
demo's layout, variant and size, and turn on the optional text input. The demo
re-renders straight away. "Restore Defaults" puts everything back. A "Code"
tab next to "Preview" shows the source for the current setup.

## Sub-features

- `customize-open`: the "Customize Preview" button expands a region of the same name.
- `customize-layout`: combobox "Layout" has the options "Stacked" and "Inline".
- `customize-variant`: combobox "Variant" (star rating: "Emoji", "Icons"; default "Icons") swaps the glyphs, for example outline stars to emoji stars.
- `customize-size`: combobox "Size" (options "sm", "default", "md", "lg"; default "default") changes the control size.
- `customize-input`: switch "Optional Text Input" adds the `Additional feedback` field after a choice.
- `customize-restore`: "Restore Defaults" resets every control.
- `customize-code`: tab "Code" in tablist "Widget Example" shows the source. Chosen options appear as props, for example `variant="emoji"` and `size="lg"`; defaults are left out.

## How to get to it (user POV)

- On any `/components/<slug>` page, choose "Customize Preview" under the demo.
- Choose the "Code" tab above the demo to see the source.

## Driving it with sv

Preconditions:

- `$SV doctor` passes, and you have run `$SV open /components/star-rating`.

- **Expand.** `$SV click --role button --name "Customize Preview"`. The snapshot shows `button "Customize Preview" [expanded]` and `region "Customize Preview"` with three comboboxes and the switch.
- **Change layout.** `$SV click --role combobox --name "Layout"`. A `listbox` shows `option "Stacked" [selected]` and `option "Inline"`. Then `$SV click --role option --name "Inline"`. The snapshot shows `combobox "Layout" value="Inline"`. Screenshot the `"Star Rating local demo"` group to show the inline bar.
- **Other selects.** Open "Variant" or "Size" the same way, then `$SV snapshot | grep option` to read the options before choosing one. The labels differ per widget. Then `$SV click --role option --name "Emoji"` (or `"lg"`), and screenshot the demo group to show the change.
- **Text input.** `$SV click --role switch --name "Optional Text Input"`. The snapshot shows `switch "Optional Text Input" [checked]`. Choosing a reaction now shows `textbox "Additional feedback"`.
- **Restore.** `$SV click --role button --name "Restore Defaults"`. The comboboxes return to "Stacked", "Icons" and "default", and the switch is no longer checked.
- **Code tab.** `$SV click --role tab --name "Code"`. The snapshot shows `tab "Code" [selected]` and `tabpanel "Code"` with a "Copy Code" button. With defaults the code is `<StarRating autoHide={false} />`. Change Variant and Size while the Code tab is open, and `$SV snapshot --within-role tabpanel --within-name "Code" | grep -n '"emoji"\|"lg"'` finds the new props.
- **Proof.** Save before and after snapshots of `region "Customize Preview"` and of the demo group, then run `$SV net-check`.

## Gotchas

- The disclosure may already be open after earlier interaction in the same tab. Check the snapshot for `[expanded]` before clicking, or the click will close it.
- Every option change remounts the demo. Interact with the widget only after the last change.
- Comboboxes are pop-up listboxes. While one is open, the rest of the page leaves the accessibility tree, so `find` fails for anything outside it. Pick an option with `click --role option`, or close the list with `$SV press Escape`, before the next step.
- The pointer stays where the last click landed. A star demo under it shows its hover preview, with stars filled up to the pointer. Move the pointer off the demo (for example, hover the page heading) before an idle screenshot.
