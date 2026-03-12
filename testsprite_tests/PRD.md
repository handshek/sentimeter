# Sentimeter — Hackathon PRD (Draft)

## 1. Overview

Sentimeter is a developer-first feedback collection system:

- End-users submit quick reactions (emoji/star/thumbs) inside an app via embedded widgets.
- Developers view aggregated analytics on a dashboard.

This PRD is a lightweight draft intended to enable automated E2E test generation.

## 2. Key user roles

- **Visitor (Signed-out)**: lands on marketing/home and can sign in/up.
- **Developer (Signed-in)**: views the dashboard.

## 3. Primary flows (MVP)

### 3.1 Signed-out navigation

- Visiting `/` shows the Sentimeter landing page.
- When signed out, the header shows a **Sign In** CTA that navigates to `/sign-in`.
- `/sign-in` renders the Clerk sign-in UI.
- `/sign-up` renders the Clerk sign-up UI.
- Visiting `/dashboard` while signed out redirects to `/sign-in`.

### 3.2 Signed-in dashboard (smoke)

- A signed-in user can navigate to `/dashboard`.
- The dashboard page renders a top nav with a user avatar button.
- The dashboard shows a welcome headline and basic placeholder stats.
- The signed-in user’s email is displayed somewhere in the header area.

## 4. Non-goals (for this test pass)

- Widget installation flows (currently placeholder).
- Backend analytics correctness and real data aggregation.
- Payment, teams, billing, and admin features.

## 5. Quality criteria

- Pages load without runtime crashes.
- Redirect behavior is correct for protected routes.
- Authentication smoke test is stable (no OTP/captcha-required steps).

