import { Github } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { HeaderSection } from "@/components/landing/header-section";
import { FooterSection } from "@/components/landing/footer-section";
import { REPOSITORY_URL } from "@/lib/widget-catalog";
import type { HostedMode } from "@/lib/hosted-config";
import { WaitlistForm } from "./waitlist-form";

export function ComingSoon({ mode }: { mode: Exclude<HostedMode, "live"> }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <HeaderSection hostedMode={mode} />
      <main
        id="main"
        className="ds-container ds-section grid flex-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]"
      >
        <section aria-labelledby="coming-soon-title" className="space-y-6">
          <div className="space-y-4">
            <p className="ds-eyebrow text-muted-foreground">Coming soon</p>
            <h1 id="coming-soon-title" className="ds-page-title">
              Hosted analytics is coming
            </h1>
            <p className="ds-body text-muted-foreground">
              A hosted place to review reactions and comments. Keep using the
              open-source widgets with your own backend while we build it.
            </p>
          </div>
          {mode === "waitlist" ? (
            <WaitlistForm />
          ) : (
            <p className="ds-body-sm text-muted-foreground">
              Watch the repository for launch updates.
            </p>
          )}
          <Button asChild variant="outline">
            <a href={REPOSITORY_URL}>
              <Github aria-hidden="true" className="size-4" /> Watch on GitHub
            </a>
          </Button>
        </section>
        <div className="space-y-4">
          <p className="ds-caption text-muted-foreground">Dashboard preview</p>
          <div aria-hidden="true" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {["Responses", "Positive ratings", "Active widgets"].map(
                (label) => (
                  <Card key={label} size="sm">
                    <CardHeader>
                      <CardTitle className="ds-label">{label}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-20 max-w-full" />
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Response volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-end gap-3 border-b border-border pb-3">
                  {["h-12", "h-20", "h-16", "h-32", "h-24", "h-36", "h-28"].map(
                    (height, index) => (
                      <Skeleton
                        key={index}
                        className={`${height} min-w-0 flex-1`}
                      />
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex items-start gap-3">
                    <Skeleton className="size-9 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-3 w-28 max-w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <FooterSection hostedMode={mode} />
    </div>
  );
}
