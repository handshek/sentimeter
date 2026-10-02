import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { hasHostedConfiguration } from "./app/_lib/hosted-config";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/(api|trpc)(.*)",
]);

const hostedMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  // Clerk validates its keys before invoking the middleware callback.
  if (!hasHostedConfiguration()) {
    if (request.nextUrl.pathname === "/widgets") {
      return NextResponse.redirect(new URL("/components", request.url));
    }

    return new NextResponse(
      "Hosted analytics is unavailable. Browse the widget registry at /components.",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return hostedMiddleware(request, event);
}

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/widgets",
    "/(api|trpc)(.*)",
  ],
};
