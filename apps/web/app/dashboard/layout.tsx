import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Activity } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { ThemeToggle } from "../_components/theme-toggle";
import { hostedMode } from "../_lib/hosted-config";
import { HostedProviders } from "../components/hosted-providers";
import { ComingSoon } from "./_components/coming-soon";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = hostedMode();
  if (mode !== "live") return <ComingSoon mode={mode} />;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <HostedProviders withConvex>
      <div className="min-h-screen bg-muted/30 text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="ds-container flex min-h-20 items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <Activity aria-hidden="true" className="size-5 text-brand" />
              Sentimeter
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="ghost"
                className="hidden text-muted-foreground sm:inline-flex"
              >
                <Link href="/components/getting-started">Documentation</Link>
              </Button>
              <ThemeToggle />
              {email ? (
                <span className="ds-caption hidden max-w-52 truncate text-muted-foreground lg:block">
                  {email}
                </span>
              ) : null}
              <UserButton />
            </div>
          </div>
        </header>
        <main id="main" className="ds-container py-8 sm:py-12">
          {children}
        </main>
      </div>
    </HostedProviders>
  );
}
