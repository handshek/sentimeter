import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { IconLayoutDashboard } from "@tabler/icons-react";
import { UserButton } from "@clerk/nextjs";

export const metadata = {
  title: "Dashboard — Sentimeter",
  description: "Your Sentimeter analytics dashboard",
};

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Top nav */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-bold tracking-tight">Sentimeter</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {user?.emailAddresses[0]?.emailAddress}
          </span>
          <UserButton />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-12 max-w-5xl mx-auto w-full">
        {/* Welcome banner */}
        <div className="mb-10 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your feedback widgets.
          </p>
        </div>

        {/* Placeholder stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Responses", value: "—" },
            { label: "Active Widgets", value: "—" },
            { label: "Avg. Sentiment", value: "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border/50 bg-muted/30 p-6 flex flex-col gap-1"
            >
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <span className="text-3xl font-bold">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div className="rounded-xl border border-border/50 bg-muted/20 flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="p-4 rounded-full bg-background border border-border shadow-sm">
            <IconLayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">No widgets yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Install a Sentimeter widget in your app to start collecting
              feedback from your users.
            </p>
          </div>
          <Button size="lg" asChild className="mt-2">
            <Link href="#">Install a Widget</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
