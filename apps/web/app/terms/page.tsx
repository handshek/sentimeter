import Link from "next/link";
import { HeaderSection } from "../_components/landing/header-section";
import { FooterSection } from "../_components/landing/footer-section";
import { hasHostedConfiguration } from "../_lib/hosted-config";

const EFFECTIVE_DATE = "April 12, 2026";
const CONTACT_EMAIL_PLACEHOLDER = "[LEGAL_CONTACT_EMAIL]";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderSection analyticsEnabled={hasHostedConfiguration()} />
      <main className="ds-container ds-section">
        <div className="ds-reading mx-auto space-y-10">
          <header className="space-y-3">
            <p className="ds-eyebrow text-muted-foreground">Legal</p>
            <h1 className="ds-page-title">Terms of Service</h1>
            <p className="ds-label text-muted-foreground">
              Effective date: {EFFECTIVE_DATE}
            </p>
          </header>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Acceptance of Terms</h2>
            <p>
              By accessing or using Sentimeter, you agree to these Terms. If you
              do not agree, do not use the service.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Use of Service</h2>
            <p>
              You may use Sentimeter only for lawful purposes. You agree not to
              abuse, disrupt, reverse engineer, or attempt unauthorized access
              to the service or related systems.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Billing and Payments</h2>
            <p>
              If paid plans are offered, checkout and billing are processed by
              Polar. Payment-related terms and policies are governed by Polar,
              available at{" "}
              <Link
                href="https://polar.sh/terms"
                className="rounded-sm text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-ring"
                target="_blank"
                rel="noreferrer"
              >
                polar.sh/terms
              </Link>{" "}
              and{" "}
              <Link
                href="https://polar.sh/privacy"
                className="rounded-sm text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-ring"
                target="_blank"
                rel="noreferrer"
              >
                polar.sh/privacy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Disclaimers</h2>
            <p>
              Sentimeter is provided on an &quot;as is&quot; and &quot;as
              available&quot; basis without warranties of any kind.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Sentimeter will not be
              liable for indirect, incidental, special, consequential, or
              punitive damages arising from your use of the service.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">
              Termination and Changes
            </h2>
            <p>
              We may suspend or terminate access for misuse or legal reasons. We
              may update these Terms from time to time; continued use after
              updates means you accept the revised Terms.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Contact</h2>
            <p>
              For questions about these Terms, contact{" "}
              <span className="font-medium text-foreground">
                {CONTACT_EMAIL_PLACEHOLDER}
              </span>
              .
            </p>
          </section>

          <p className="ds-caption text-muted-foreground">
            This page is a minimal template and does not constitute legal
            advice.
          </p>
        </div>
      </main>
      <FooterSection analyticsEnabled={hasHostedConfiguration()} />
    </div>
  );
}
