export type HostedMode = "live" | "waitlist" | "off";

type HostedEnvironment = Partial<
  Pick<
    NodeJS.ProcessEnv,
    | "NODE_ENV"
    | "HOSTED_ANALYTICS"
    | "WAITLIST_SECRET"
    | "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    | "CLERK_SECRET_KEY"
    | "NEXT_PUBLIC_CONVEX_URL"
  >
>;

export function hasHostedConfiguration(
  environment: HostedEnvironment = process.env,
) {
  return Boolean(
    environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
    environment.CLERK_SECRET_KEY?.trim() &&
    environment.NEXT_PUBLIC_CONVEX_URL?.trim(),
  );
}

// Hosted analytics is unreleased. Its routes open only when a developer sets
// HOSTED_ANALYTICS=live alongside the Clerk and Convex keys, in any environment.
export function resolveHostedMode(environment: HostedEnvironment): HostedMode {
  if (
    environment.HOSTED_ANALYTICS === "live" &&
    hasHostedConfiguration(environment)
  ) {
    return "live";
  }

  if (
    environment.NEXT_PUBLIC_CONVEX_URL?.trim() &&
    environment.WAITLIST_SECRET?.trim()
  ) {
    return "waitlist";
  }

  return "off";
}

export function hostedMode(): HostedMode {
  return resolveHostedMode(process.env);
}

export function hostedRedirect(pathname: string, mode: HostedMode) {
  if (mode === "live") return null;
  if (pathname === "/widgets") return "/components";
  if (
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/dashboard/")
  ) {
    return "/dashboard";
  }
  return null;
}
