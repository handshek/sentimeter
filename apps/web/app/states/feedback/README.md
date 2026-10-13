# Local feedback state workbench

Open `http://localhost:3000/states/feedback`. This local-only page uses Jakub
Krehel's `state-machine` skill and Sentimeter's existing shadcn primitives.
It imports the real StarRating, EmojiFeedback and LikeDislike components.

The selected widget, layout and scenario live in the URL:

`/states/feedback?widget=star&layout=stacked&__state=submitting`

Scenarios are idle, selected (with a comment), submitting, failure/retry, done,
disabled and dismissed. Submitting stays pending; failure retries succeed;
confirmation does not auto-hide. No account or feature states are invented.
Every submission uses a local mock, with no credentials or network persistence.

The grouped state list becomes a Select in narrow containers. Arrow keys move
between list buttons; H toggles its visibility when workbench controls are
focused. Shortcuts do not intercept the widget or editable/composite controls.
Restart scenario restores its fixture. Browser back/forward restores URL choices.

The fixture uses the public feedback context from a nonvisual title child;
the real footer's submit button still handles the submission and its sizing.
No production widget API or rendering is changed.

This workbench is versioned for local development. The route returns not-found
outside development and is not linked into the app navigation. It is a candidate
for later web-app integration, not a permanent product page. Keep it while
iterating; remove this one folder only when asked. A future integration should
move its useful parts into the design-system reference and add maintained tests.
