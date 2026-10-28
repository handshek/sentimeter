import type { Metadata } from "next";
import { HeaderSection } from "@/components/landing/header-section";
import { FooterSection } from "@/components/landing/footer-section";
import { hostedMode } from "@/lib/hosted-config";
import { LEGAL_CONTACT_EMAIL, REPOSITORY_URL } from "@/lib/widget-catalog";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Sentimeter handles request logs, cookieless analytics, and hosted analytics waitlist emails.",
};

export default function PrivacyPage() {
  const mode = hostedMode();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderSection hostedMode={mode} />
      <main className="ds-container ds-section">
        <div className="ds-reading mx-auto space-y-10">
          <header className="space-y-3">
            <p className="ds-eyebrow text-muted-foreground">Privacy</p>
            <h1 className="ds-page-title">
              A small amount of data, for a clear purpose
            </h1>
            <p className="ds-body text-muted-foreground">
              Sentimeter publishes open-source feedback widgets. Browsing or
              installing them does not require an account.
            </p>
          </header>
          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Request logs</h2>
            <p>
              Vercel hosts this website and Cloudflare hosts the registry. They
              may process request details, including IP addresses, to deliver
              the site and registry and maintain security.
            </p>
          </section>
          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Website analytics</h2>
            <p>
              We use Vercel Web Analytics to understand page visits and improve
              the documentation. It uses cookieless analytics.
            </p>
          </section>
          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Waitlist emails</h2>
            <p>
              If you join the hosted analytics waitlist, we store your email,
              signup time and signup source in Convex so we can notify you when
              it is available. We use your IP address for signup rate limiting.
              We keep waitlist emails until launch notifications are complete or
              you request removal.
            </p>
          </section>
          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Installed widgets</h2>
            <p>
              Widgets complete locally by default. A developer can supply their
              own submit handler to save feedback. That developer controls the
              destination and its privacy practices.
            </p>
          </section>
          <section className="space-y-3 ds-body text-muted-foreground">
            <h2 className="ds-title text-foreground">Contact and removal</h2>
            <p>
              For privacy questions or to remove a waitlist email,{" "}
              {LEGAL_CONTACT_EMAIL ? (
                <a
                  href={`mailto:${LEGAL_CONTACT_EMAIL}`}
                  className="rounded-sm text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  email {LEGAL_CONTACT_EMAIL}
                </a>
              ) : (
                <a
                  href={`${REPOSITORY_URL}/issues`}
                  className="rounded-sm text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  open an issue on GitHub
                </a>
              )}
              {LEGAL_CONTACT_EMAIL
                ? "."
                : " and we will reply with a private contact."}
            </p>
          </section>
        </div>
      </main>
      <FooterSection hostedMode={mode} />
    </div>
  );
}
