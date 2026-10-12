import Link from "next/link";
import { HeaderSection } from "../_components/landing/header-section";
import { FooterSection } from "../_components/landing/footer-section";
import { hasHostedConfiguration } from "../_lib/hosted-config";

const EFFECTIVE_DATE = "April 12, 2026";
const CONTACT_EMAIL_PLACEHOLDER = "[LEGAL_CONTACT_EMAIL]";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderSection analyticsEnabled={hasHostedConfiguration()} />
      <main className="ds-container ds-section">
        <div className="ds-reading mx-auto space-y-10">
          <header className="space-y-3">
            <p className="ds-eyebrow text-muted-foreground">Legal</p>
            <h1 className="ds-page-title">Privacy Policy</h1>
            <p className="ds-label text-muted-foreground">
              Effective date: {EFFECTIVE_DATE}
            </p>
          </header>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Information We Collect</h2>
            <p>
              Sentimeter collects account and project information you provide,
              feedback submissions sent through widgets, and service usage data
              needed to operate and improve the product.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">How We Use Information</h2>
            <p>
              We use information to provide analytics dashboards, process
              feedback, support users, maintain security, and improve
              performance and reliability.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Third-Party Services</h2>
            <p>
              We use third-party infrastructure and service providers to operate
              Sentimeter. For checkout and billing, payments are processed by
              Polar. Please review{" "}
              <Link
                href="https://polar.sh/privacy"
                className="rounded-sm text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-ring"
                target="_blank"
                rel="noreferrer"
              >
                Polar&apos;s Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="https://polar.sh/terms"
                className="rounded-sm text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-ring"
                target="_blank"
                rel="noreferrer"
              >
                Polar&apos;s Terms
              </Link>{" "}
              for payment-specific practices.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">
              Data Retention and Security
            </h2>
            <p>
              We retain data for as long as needed to provide the service and
              comply with legal obligations. We use reasonable safeguards to
              protect information, but no method of storage or transmission is
              fully secure.
            </p>
          </section>

          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Contact</h2>
            <p>
              For privacy requests or questions, contact{" "}
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
