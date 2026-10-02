import type { ReactNode } from "react";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { hasHostedConfiguration } from "../_lib/hosted-config";
import ConvexClientProvider from "./convex-clerk-provider";

export function HostedProviders({
  children,
  withConvex = false,
}: {
  children?: ReactNode;
  withConvex?: boolean;
}) {
  if (!hasHostedConfiguration()) {
    return (
      <main className="mx-auto max-w-xl space-y-4 px-4 py-16">
        <h1 className="text-2xl font-semibold">
          Hosted Analytics Is Unavailable
        </h1>
        <p className="text-muted-foreground">
          Configure Clerk and Convex to use hosted analytics. The widget
          registry works without either service.
        </p>
        <Button asChild>
          <Link href="/components">Browse Widgets</Link>
        </Button>
      </main>
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      {withConvex ? (
        <ConvexClientProvider url={convexUrl}>{children}</ConvexClientProvider>
      ) : (
        children
      )}
    </ClerkProvider>
  );
}
