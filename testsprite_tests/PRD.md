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

### 3.2 Clerk sign-in flow (CRITICAL for test generation)

Clerk uses a **two-step** sign-in. Tests MUST follow this exact sequence:

1. **Step 1:** Enter email in the email field → Click "Continue". The form shows only the email field at first.
2. **Step 2:** Wait for the password field to appear. Enter password → Click "Continue".
3. **Step 3:** Wait for redirect to `/dashboard`.

**Do NOT:** Fill email and password in the same form/modal. Do NOT assume both fields are visible initially. The password field appears only after the first Continue click.

### 3.3 Signed-in dashboard (smoke)

- A signed-in user can navigate to `/dashboard`.
- The dashboard page renders a top nav with a user avatar button.
- The dashboard shows a welcome headline and basic placeholder stats.
- The signed-in user’s email is displayed somewhere in the header area.

- Dashboard has a "Create Project" button that opens a modal.
- Projects list area is visible; user can click a project to go to `/dashboard/projects/[projectId]`.

### 3.4 Project detail page

- `/dashboard/projects/[projectId]` shows project analytics (charts, feedback breakdown by widget type, date range).
- Requires sign-in; redirects to sign-in if not authenticated.

### 3.5 Widgets showcase

- `/widgets` shows embeddable feedback widgets (emoji, thumbs, star rating) for developers to preview.

## 4. Non-goals (for this test pass)

- Widget installation flows (currently placeholder).
- Backend analytics correctness and real data aggregation.
- Payment, teams, billing, and admin features.

## 5. Quality criteria

- Pages load without runtime crashes.
- Redirect behavior is correct for protected routes.
- Authentication smoke test is stable (no OTP/captcha-required steps).

