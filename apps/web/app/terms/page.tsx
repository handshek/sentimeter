import Link from "next/link";

const EFFECTIVE_DATE = "April 12, 2026";
const CONTACT_EMAIL_PLACEHOLDER = "[LEGAL_CONTACT_EMAIL]";

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-14">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: {EFFECTIVE_DATE}
          </p>
        </header>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            Acceptance of Terms
          </h2>
          <p>
            By accessing or using Sentimeter, you agree to these Terms. If you
            do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Use of Service</h2>
          <p>
            You may use Sentimeter only for lawful purposes. You agree not to
            abuse, disrupt, reverse engineer, or attempt unauthorized access to
            the service or related systems.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            Billing and Payments
          </h2>
          <p>
            If paid plans are offered, checkout and billing are processed by
            Polar. Payment-related terms and policies are governed by Polar,
            available at{" "}
            <Link
              href="https://polar.sh/terms"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noreferrer"
            >
              polar.sh/terms
            </Link>{" "}
            and{" "}
            <Link
              href="https://polar.sh/privacy"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noreferrer"
            >
              polar.sh/privacy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Disclaimers</h2>
          <p>
            Sentimeter is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis without warranties of any kind.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, Sentimeter will not be
            liable for indirect, incidental, special, consequential, or
            punitive damages arising from your use of the service.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">
            Termination and Changes
          </h2>
          <p>
            We may suspend or terminate access for misuse or legal reasons. We
            may update these Terms from time to time; continued use after
            updates means you accept the revised Terms.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-muted-foreground">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            For questions about these Terms, contact{" "}
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
