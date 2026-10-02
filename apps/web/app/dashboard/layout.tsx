import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { hasHostedConfiguration } from "../_lib/hosted-config";
import { HostedProviders } from "../components/hosted-providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasHostedConfiguration()) return <HostedProviders />;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <HostedProviders withConvex>
      <div className="min-h-screen bg-muted/40 text-foreground">
        <header className="sticky top-0 z-50 border-b border-border bg-background">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="inline-flex h-6 w-[2px] rounded-full bg-primary/80" />
              <span className="text-sm font-semibold tracking-wide">
                SENTIMETER
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {email ? (
                <span className="hidden text-xs text-muted-foreground sm:block">
                  {email}
                </span>
              ) : null}
              <UserButton />
            </div>
          </div>
        </header>

        <main
          id="main"
          className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10"
        >
          {children}
        </main>
      </div>
    </HostedProviders>
  );
}
