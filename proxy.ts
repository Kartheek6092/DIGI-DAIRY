import { NextResponse } from "next/server";
import { auth } from "./lib/auth";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/calendar", "/diary", "/settings"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );
  
  const isAuthRoute = authRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/calendar", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Use negative matching to skip Next.js internals, static files, and api routes
  // (API routes have their own auth guards)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};
