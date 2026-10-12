import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "../../_components/theme-toggle";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="ds-container flex min-h-20 items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <Activity aria-hidden="true" className="size-5 text-brand" />
          Sentimeter
        </Link>
        <ThemeToggle />
      </header>
      <main className="ds-container flex flex-col items-center py-10 sm:py-16">
        <div className="mb-8 w-full max-w-sm text-center">
          <h1 className="ds-page-title">A place to listen.</h1>
          <p className="ds-body mt-4 text-muted-foreground">
            Create an account for optional hosted feedback analytics.
          </p>
        </div>
        <div className="w-full max-w-sm">
          <SignUp
            routing="path"
            path="/sign-up"
            appearance={{ elements: { rootBox: "w-full", cardBox: "w-full" } }}
          />
        </div>
        <p className="ds-caption mt-8 text-center text-muted-foreground">
          You don’t need an account to install the widgets.
        </p>
        <Button asChild variant="ghost" className="mt-2 text-muted-foreground">
          <Link href="/components">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to the collection
          </Link>
        </Button>
      </main>
    </div>
  );
}
