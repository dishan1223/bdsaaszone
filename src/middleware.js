import { NextResponse } from "next/server";

// 1. Define which routes need a login
const PROTECTED_ROUTES = ["/dashboard", "/new", "/profile", "/courses" , "/startup/edit"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 2. Check if the user is trying to access a protected route
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected) {
    // 3. Better Auth stores the session in this cookie by default
    const sessionCookie = request.cookies.get("better-auth.session_token");

    // 4. If no cookie, redirect them to login
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      // Optional: Store the page they were trying to visit so you can redirect them back later
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// 5. Optimization: Only run this middleware on relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};