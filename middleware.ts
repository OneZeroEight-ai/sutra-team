/**
 * Subdomain routing middleware.
 * law.sutra.team → /(law)/* routes
 * All other hosts → default routing
 *
 * Uses clerkMiddleware for auth token handling.
 */

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";

  // Subdomain routing: law.sutra.team → /(law)/* routes
  if (
    hostname.startsWith("law.sutra.team") ||
    hostname.startsWith("law.localhost")
  ) {
    // Don't rewrite API routes or static assets
    if (
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/_next/") ||
      url.pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Rewrite to (law) route group
    url.pathname = `/(law)${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
