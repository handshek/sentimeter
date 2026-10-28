# Security Policy

## Reporting a vulnerability

Please report security issues privately through
[GitHub's private vulnerability reporting](https://github.com/handshek/sentimeter/security/advisories/new),
not in public issues or pull requests. If that isn't available to you, email
hi@abshk.dev.

Include the affected widget, route, or package, steps to reproduce, and the
impact you expect. You'll get an acknowledgement within a few days, and a fix or
mitigation plan once the report is confirmed.

## Scope

- Widget source installed from the registry (`packages/widgets`).
- The registry Worker (`apps/registry`) and the website (`apps/web`), including
  the waitlist.

Hosted analytics is unreleased and not deployed, so issues that only affect it
are lower priority but still welcome.

## Supported versions

Only the latest registry release receives fixes. Installed widgets are your own
source code; update them by re-running `shadcn add`.
