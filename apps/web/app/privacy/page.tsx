import Link from "next/link";

const EFFECTIVE_DATE = "April 12, 2026";
const CONTACT_EMAIL_PLACEHOLDER = "[LEGAL_CONTACT_EMAIL]";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-14">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            Information We Collect
          </h2>
          <p>
            Sentimeter collects account and project information you provide,
            feedback submissions sent through widgets, and service usage data
            needed to operate and improve the product.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            How We Use Information
          </h2>
          <p>
            We use information to provide analytics dashboards, process
            feedback, support users, maintain security, and improve performance
            and reliability.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p>
            We use third-party infrastructure and service providers to operate
            Sentimeter. For checkout and billing, payments are processed by
            Polar. Please review{" "}
            <Link
              href="https://polar.sh/privacy"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noreferrer"
            >
              Polar&apos;s Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="https://polar.sh/terms"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noreferrer"
            >
              Polar&apos;s Terms
            </Link>{" "}
            for payment-specific practices.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            Data Retention and Security
          </h2>
          <p>
            We retain data for as long as needed to provide the service and
            comply with legal obligations. We use reasonable safeguards to
            protect information, but no method of storage or transmission is
            fully secure.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            For privacy requests or questions, contact{" "}
            <span className="font-medium text-foreground">
              {CONTACT_EMAIL_PLACEHOLDER}
            </span>
            .
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          This page is a minimal template and does not constitute legal advice.
        </p>
      </div>
    </main>
  );
}
