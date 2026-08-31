import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

const adminPaths = ["/admin"];

export default auth((req) => {
  const { nextUrl, auth } = req;

  const isAdminRoute = adminPaths.some((path) => nextUrl.pathname.startsWith(path));
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  if (!auth || !auth.user) {
    const signInUrl = new URL("/login", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.href);
    return NextResponse.redirect(signInUrl);
  }

  const roles = auth.user.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  if (!isAdmin) {
    const unauthorizedUrl = new URL("/unauthorized", nextUrl.origin);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
