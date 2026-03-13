import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
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

      <main id="main" className="mx-auto max-w-5xl px-6 py-10">
        <div className="relative">
          <div className="pointer-events-none absolute -left-6 top-0 h-full w-px bg-border/60" />
          <div className="pl-0">{children}</div>
        </div>
      </main>
    </div>
  );
}

