import type { BlockSlug } from "./block-catalog";

/** Where each block goes in a host app, shown in the block page's Code tab. */
export const blockUsage: Record<BlockSlug, string> = {
  "floating-feedback": `// app/layout.tsx
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
  "report-problem": `// components/account-menu.tsx
import { ReportProblem } from "@/components/sentimeter/blocks/report-problem";

export function AccountMenu() {
  return (
    <nav className="flex items-center gap-2">
      <ReportProblem submit={sendFeedback} />
    </nav>
  );
}`,
  "error-feedback": `// app/error.tsx is installed for you.
// Pass your handler to FeedbackForm inside it to send reports:
<FeedbackForm
  title="What were you trying to do?"
  location={error.digest ? \`error:\${error.digest}\` : "error"}
  submit={sendFeedback}
/>`,
  "was-this-helpful": `// app/docs/[slug]/page.tsx
import { WasThisHelpful } from "@/components/sentimeter/blocks/was-this-helpful";

export default function DocPage() {
  return (
    <article>
      {/* …your content */}
      <WasThisHelpful location="docs/getting-started" submit={sendFeedback} />
    </article>
  );
}`,
  "after-task-rating": `// app/checkout/success/page.tsx
import { AfterTaskRating } from "@/components/sentimeter/blocks/after-task-rating";

export default function CheckoutSuccess() {
  return <AfterTaskRating done="Order placed" question="How was checkout?" submit={sendFeedback} />;
}`,
  "cancel-flow-survey": `// app/settings/billing/page.tsx
import { CancelFlowSurvey } from "@/components/sentimeter/blocks/cancel-flow-survey";

export default function Billing() {
  return (
    <CancelFlowSurvey
      endsOn="30 Nov"
      submit={sendFeedback}
      cancelPlan={() => cancelSubscription()}
    />
  );
}`,
};
