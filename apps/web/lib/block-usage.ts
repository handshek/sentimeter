import type { BlockSlug } from "./block-catalog";

// Server Components can pass server actions to these Client Components, but
// not ordinary functions, so every example imports its handlers from a
// "use server" file such as this one:
const actions = `// app/actions.ts
"use server";

import type { WidgetPayload } from "@/components/sentimeter/feedback-system";

export async function sendFeedback(payload: WidgetPayload) {
  // Save the payload to your database or forward it to your tools.
}`;

/** Where each block goes in a host app, shown in the block page's Code tab. */
export const blockUsage: Record<BlockSlug, string> = {
  "floating-feedback": `${actions}

// app/layout.tsx
import { sendFeedback } from "@/app/actions";
import { FloatingFeedback } from "@/components/sentimeter/blocks/floating-feedback";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FloatingFeedback submit={sendFeedback} />
      </body>
    </html>
  );
}`,
  "report-problem": `${actions}

// components/site-header.tsx
import { sendFeedback } from "@/app/actions";
import { ReportProblem } from "@/components/sentimeter/blocks/report-problem";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between">
      <Logo />
      <ReportProblem submit={sendFeedback} />
    </header>
  );
}`,
  "error-feedback": `// app/error.tsx is installed for you as a Client Component.
// Import your server action there and pass it to the form:
import { sendFeedback } from "@/app/actions";

<FeedbackForm
  title="What were you trying to do?"
  location={error.digest ? \`error:\${error.digest}\` : "error"}
  submit={sendFeedback}
/>`,
  "was-this-helpful": `${actions}

// app/docs/[slug]/page.tsx
import { sendFeedback } from "@/app/actions";
import { WasThisHelpful } from "@/components/sentimeter/blocks/was-this-helpful";

export default function DocPage() {
  return (
    <article>
      {/* …your content */}
      <WasThisHelpful location="docs/getting-started" submit={sendFeedback} />
    </article>
  );
}`,
  "after-task-rating": `${actions}

// app/checkout/success/page.tsx
import { sendFeedback } from "@/app/actions";
import { AfterTaskRating } from "@/components/sentimeter/blocks/after-task-rating";

export default function CheckoutSuccess() {
  return <AfterTaskRating submit={sendFeedback} />;
}`,
  "cancel-flow-survey": `// app/actions.ts
"use server";

import type { WidgetPayload } from "@/components/sentimeter/feedback-system";

export async function sendFeedback(payload: WidgetPayload) {
  // Save the reason with the account.
}

export async function cancelSubscription() {
  // Cancel the plan with your billing provider.
}

// app/settings/billing/page.tsx
import { cancelSubscription, sendFeedback } from "@/app/actions";
import { CancelFlowSurvey } from "@/components/sentimeter/blocks/cancel-flow-survey";

export default function Billing() {
  return (
    <CancelFlowSurvey
      endsOn="30 Nov"
      submit={sendFeedback}
      cancelPlan={cancelSubscription}
    />
  );
}`,
};
