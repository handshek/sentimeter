# Sentimeter Context

This file names the main product concepts in Sentimeter. It is descriptive, not
an architecture decision log. Use it before domain-level refactors, architecture
work, or renaming product concepts.

For operating rules, read `AGENTS.md`. For visual design rules, read
`DESIGN_PHILOSOPHY.md`.

## Product Shape

Sentimeter is a shadcn-first feedback collection system. Developers install
open-code React widgets into their own shadcn projects, users submit lightweight
reactions in the host product, and the developer watches feedback analytics in a
hosted dashboard.

Sentimeter's core promise is that the widget feels native inside the developer's
own UI while feedback still lands in one realtime analytics workspace.

## Runtime Shape

Sentimeter uses three runtime surfaces:

- `apps/web` serves the Next.js dashboard, public pages, docs pages, Clerk auth,
  and Convex client subscriptions.
- `apps/registry` serves shadcn registry JSON from a Cloudflare Worker so
  developers can install widgets with `shadcn add <url>`. Registry Item source
  is emitted from `packages/widgets` into a private, ignored staging tree before
  the public JSON is built.
- Convex stores projects, API keys, and feedback. Convex HTTP actions receive
  feedback from installed widgets and enforce API-key, origin, value, and rate
  rules.

## Core Concepts

### Widget

An installable React feedback surface. Current widget types are `emoji`,
`thumbs`, and `star`. Widgets must work as open code inside the developer's
shadcn project, not as opaque iframes or remote embeds. `packages/widgets` is
the sole canonical source for Widget behavior; workspace imports and Registry
Items are two forms of that behavior.

### Registry Item

The shadcn registry JSON and generated source tree that install a Widget into a
host app. Registry Items are emitted from canonical Widget source, use
host-local imports, and install as readable modular open code. They should
depend on public URLs and local shadcn conventions so the developer does not
need custom package configuration after install.

### Feedback Intake

The workflow that turns a widget submission into a stored feedback row. It
includes payload validation, API-key lookup, origin allowlisting, rate limiting,
text trimming, value validation, CORS response shaping, and Convex insertion.

### Project

A developer-owned workspace for a product or app that receives feedback. Projects
own API keys, allowed origins, feedback rows, dashboard analytics, and install
instructions.

### API Key

A public publishable key used by installed widgets to identify the destination
project. Keys can be rotated; revoked keys must not accept feedback.

### Allowed Origin

An optional list of browser origins permitted to submit feedback for a project.
An empty list means development-friendly open intake. A non-empty list turns
origin checks into a first-class production gate.

### Dashboard

The authenticated developer workspace for projects, install guidance, API-key
management, origin configuration, and realtime analytics.

### Analytics

Aggregated feedback views derived from Convex feedback rows: totals, rating
breakdowns, widget breakdowns, location breakdowns, and time series. Analytics
should make recent product sentiment visible without hiding the raw feedback
stream.

If docs conflict with code, treat code as current behavior and update docs when
practical.
