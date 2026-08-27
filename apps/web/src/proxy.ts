import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('auth_token');
  const pendingCookie = request.cookies.get('pending_auth');

  const path = request.nextUrl.pathname;
  
  const isPublicPath = path === '/login';
  const isOnboardingPath = path === '/onboarding';

  if (!authCookie && !pendingCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authCookie && (isPublicPath || isOnboardingPath)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pendingCookie && !authCookie && !isOnboardingPath) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

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
