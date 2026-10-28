import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { HeaderSection } from "@/components/landing/header-section";
import { FooterSection } from "@/components/landing/footer-section";
import { hostedMode } from "@/lib/hosted-config";

export default function NotFound() {
  const mode = hostedMode();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderSection hostedMode={mode} />
      <main className="ds-container ds-section">
        <Card className="ds-reading mx-auto">
          <CardContent className="space-y-6 p-(--ds-panel-inset)">
            <p className="ds-eyebrow text-muted-foreground">404</p>
            <h1 className="ds-page-title">Page not found</h1>
            <p className="ds-body text-muted-foreground">
              This page may have moved. Browse the widgets to find an
              installable component.
            </p>
            <Button asChild>
              <Link href="/components">Browse widgets</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <FooterSection hostedMode={mode} />
    </div>
  );
}
