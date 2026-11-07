# Landing page

The landing page at `/` introduces Sentimeter with working widget examples in
the hero and in each product section, an install command, links into the docs
and design system, and a theme toggle.

## Sub-features

- `landing-hero`: region "A little feedback. A better product." with the links "Find your widget" and "Read the docs", an emoji example, and the install tabs.
- `landing-examples`: the groups "emoji feedback example" and "thumbs feedback example" (plus stars further down), each with a "Reset example" button.
- `landing-nav`: navigation "Main" with the links "Widgets", "Documentation" and "Design system", plus "Sentimeter on GitHub".
- `landing-theme`: the "Toggle Color Theme" button switches between light and dark.
- `landing-hosted-hidden`: no waitlist teaser while hosted mode is off.

## How to get to it (user POV)

- Open the site root, or follow the "Sentimeter home" link from any page.

## Driving it with sv

Preconditions:

- `$SV doctor` passes, and you have run `$SV open /`.

- **Hero example.** `$SV click --role button --name "Rating 5 of 5" --within-role region --within-name "A little feedback. A better product."`, then `$SV click --role button --name "Submit" --within-role region --within-name "A little feedback. A better product."`. A snapshot of that region shows `button "Rating 5 of 5" [pressed, disabled]` and a `status` reading "Thanks for sharing.". The hero card always shows a "Share your thoughts" field, and after submit its button reads "Try again". Other examples on the page use "Reset example".
- **Navigate.** `$SV click --role link --name "Documentation" --within-role navigation --within-name "Main"`. The page becomes `RootWebArea "Getting Started | Sentimeter"`, and a `complementary` sidebar appears with links "Overview", "Installation & Integration", "Design System", "Emoji Feedback", "Like / Dislike" and "Star Rating". The sidebar is not a `navigation` landmark. Take a snapshot to show it.
- **Theme.** `$SV screenshot --out landing/01-theme-before.png`, then `$SV click --role button --name "Toggle Color Theme"` and `$SV screenshot --out landing/02-theme-after.png`. The two screenshots differ in background brightness. The docs pages call the same control "Toggle Theme".
- **Hosted hidden.** `$SV snapshot | grep -i waitlist` prints nothing.
- **Proof.** Snapshots, before and after screenshots, and `$SV net-check`.

## Gotchas

- The name "emoji feedback example" repeats: the hero and the product section each have one. A `--within-*` scope always resolves to the first match, so scope by the section region (its name is the section heading). `--nth i` picks among matching targets, not among scopes.
- Theme preference persists in the scratch Chrome profile for the rest of the run. Toggle it back, or expect the other theme on later pages.
- Examples reset when you leave the page. Prove an example's state before navigating away.
