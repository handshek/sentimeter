import Link from "next/link";
import { ArrowDown, Github } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { WidgetInstallCommand } from "@/components/docs/widget-install-command";
import { REPOSITORY_URL } from "@/lib/widget-catalog";

export function HeroSection() {
  return (
    <section aria-labelledby="introduction" className="ds-container pt-8">
      <div className="flex flex-col items-center gap-6 rounded-3xl border bg-card px-6 py-16 text-center sm:px-12 sm:py-20">
        <p className="ds-eyebrow text-muted-foreground">
          Open-source feedback components for shadcn
        </p>
        <h1 id="introduction" className="ds-display max-w-5xl text-balance">
          Your app will break.
          <br className="max-sm:hidden" /> Let users tell you in seconds.
        </h1>
        <p className="ds-lead max-w-xl text-pretty text-muted-foreground">
          Install open-code components that look native in your app and save to
          your own backend. When something goes wrong, users tell you in one
          line.
        </p>
        <div className="w-full max-w-3xl text-left">
          <WidgetInstallCommand registryName="floating-feedback" />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="#when-something-breaks">
              Browse components{" "}
              <ArrowDown aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={REPOSITORY_URL}>
              <Github aria-hidden="true" className="size-4" />
              Star on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
