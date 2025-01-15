import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('id');
  const refreshCookie = request.cookies.get('rid');

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If no auth cookies and trying to access protected route
  if (!authCookie && !refreshCookie && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has auth cookies but trying to access public route
  if ((authCookie || refreshCookie) && isPublicPath) {
    return NextResponse.redirect(new URL('/channels/me', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/channels/:path*',
    '/me/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
