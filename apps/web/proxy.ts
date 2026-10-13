import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { hostedMode, hostedRedirect } from "./app/_lib/hosted-config";

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
  const mode = hostedMode();
  if (mode !== "live") {
    const destination = hostedRedirect(request.nextUrl.pathname, mode);
    if (destination) {
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
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
