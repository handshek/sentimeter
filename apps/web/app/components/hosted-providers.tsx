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
      <main className="ds-container ds-section max-w-xl space-y-5">
        <h1 className="ds-page-title">Hosted Analytics Is Unavailable</h1>
        <p className="ds-body text-muted-foreground">
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
      appearance={{
        variables: {
          colorPrimary: "var(--primary)",
          colorPrimaryForeground: "var(--primary-foreground)",
          colorBackground: "var(--card)",
          colorForeground: "var(--foreground)",
          colorMuted: "var(--muted)",
          colorMutedForeground: "var(--muted-foreground)",
          colorInput: "var(--background)",
          colorInputForeground: "var(--foreground)",
          colorBorder: "var(--border)",
          colorRing: "var(--ring)",
          colorDanger: "var(--destructive)",
          colorSuccess: "var(--success)",
          colorWarning: "var(--warning)",
          fontFamily: "var(--ds-font-body)",
          fontFamilyButtons: "var(--ds-font-body)",
          fontFamilyMono: "var(--ds-font-code)",
          borderRadius: "var(--radius)",
        },
      }}
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
