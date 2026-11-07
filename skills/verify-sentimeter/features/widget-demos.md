# Widget demos

Each widget docs page has a live demo of the real widget. A user picks a
reaction, can add a comment if the text input is on, then submits or cancels.
Submitting shows a "Thanks!" status, with no account and no network request.
A Reset or Try again button below the card starts over.

## Sub-features

- `demo-select`: choosing a reaction marks it pressed and shows Cancel and Submit.
- `demo-submit`: Submit disables the reactions, keeps the choice pressed, and shows `status` "Thanks!".
- `demo-cancel`: Cancel clears an unsubmitted choice.
- `demo-comment`: with Optional Text Input on, the `Additional feedback` textbox appears after a choice.
- `demo-reset`: Reset, or "Try again" after submit, gives a fresh widget and focuses the first reaction.
- `demo-keyboard`: Tab reaches the reactions, and Space or Enter chooses one.

## How to get to it (user POV)

- `/components/emoji-feedback`: the group "Emoji Feedback local demo" with reactions "Rating 1 of 5" … "Rating 5 of 5".
- `/components/like-dislike`: the group "Like / Dislike local demo" with "Like" and "Dislike".
- `/components/star-rating`: the group "Star Rating local demo" with "Rate 1 star", "Rate 2 stars" … "Rate 5 stars".
- Docs sidebar links "Emoji Feedback", "Like / Dislike", and "Star Rating" lead to the same pages.

## Driving it with sv

Preconditions:

- `$SV doctor` passes.
- Set `G=(--within-role group --within-name "Emoji Feedback local demo")`, or the thumbs or stars group name.

- **Open.** `$SV open /components/emoji-feedback`, then `$SV snapshot "${G[@]}" --out emoji/01-idle.aria.txt`. All five reactions appear with no state, plus a `Reset` button.
- **Select.** `$SV hover --role button --name "Rating 4 of 5"`, then `$SV click --role button --name "Rating 4 of 5"` and `$SV wait --role button --name "Rating 4 of 5" --state pressed`. The snapshot shows `button "Rating 4 of 5" [pressed, focused]`, then `Cancel` and `Submit`.
- **Submit.** `$SV click --role button --name "Submit" "${G[@]}"`, then `$SV wait --role button --name "Try again" --timeout 8000`. The snapshot shows every reaction `[disabled]`, rating 4 `[pressed, disabled]`, and `status [focused]` with "Thanks!". Take `$SV screenshot --role group --name "Emoji Feedback local demo" --out emoji/03-done.png`.
- **Try again.** `$SV click --role button --name "Try again"`. The snapshot shows the idle reactions with `"Rating 1 of 5" [focused]` and a `Reset` button.
- **Cancel.** Select a reaction, then `$SV click --role button --name "Cancel" "${G[@]}"`. No reaction is pressed, Cancel and Submit are gone, and focus moves to `"Rating 1 of 5" [focused]`.
- **Comment.** On `/components/star-rating`, open Customize Preview and turn on `switch "Optional Text Input"` (see [customize-preview](./customize-preview.md)). Then `$SV click --role button --name "Rate 2 stars"` and `$SV type --role textbox --name "Additional feedback" --text "Checkout froze twice" --within-role group --within-name "Star Rating local demo"`. The snapshot shows `textbox "Additional feedback" value="Checkout froze twice"`. Submit, and "Thanks!" appears.
- **Keyboard.** On `/components/like-dislike`, run `$SV click --role button --name "Reset"`. This focuses "Like". Then `$SV press Space`. The snapshot shows `button "Like" [pressed, focused]`, then `Cancel` and `Submit`.
- **Proof.** Finish with `$SV net-check`. It must report no requests leaving `127.0.0.1`.

## Gotchas

- "Thanks!" is the status's text child; the `status` itself has no name. Wait with `--role button --name "Try again"` or `--text "Thanks!"`, not with `--role status --name "Thanks!"`.
- Arrow keys do not move between Like and Dislike. Use Tab.
- Before submit the button below the card reads `Reset`; after submit it reads `Try again`. Both are the same control.
- Changing a Customize Preview option remounts the demo and drops its state. Change options first, then interact.
- Each widget's docs page has exactly one local demo. The landing page has several widget examples with repeated names; use `--nth` there.
