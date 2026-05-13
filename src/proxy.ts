import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/council/deliberate(.*)",
  "/council/session(.*)",
  "/dashboard(.*)",
  "/persona-editor(.*)",
  "/api/council/deliberate(.*)",
  "/law/dashboard(.*)",
  "/law/checkout(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  // Subdomain routing: law.sutra.team → /law/* routes
  if (
    hostname.startsWith("law.sutra.team") ||
    hostname.startsWith("law.localhost")
  ) {
    if (
      !url.pathname.startsWith("/api/") &&
      !url.pathname.startsWith("/_next/") &&
      !url.pathname.startsWith("/law") &&
      !url.pathname.includes(".")
    ) {
      url.pathname = `/law${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
