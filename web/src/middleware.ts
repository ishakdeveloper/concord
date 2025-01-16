import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const cookieOpts = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  domain:
    process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost',
  maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
};

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('id');
  const refreshCookie = request.cookies.get('rid');

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If no auth cookies and trying to access protected route
  if (!authCookie?.value && !refreshCookie?.value && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has auth cookies but trying to access public route
  if ((authCookie?.value || refreshCookie?.value) && isPublicPath) {
    return NextResponse.redirect(new URL('/channels/me', request.url));
  }

  // Clone the response to modify cookies
  const response = NextResponse.next();

  // Set new tokens if they exist in the response cookies
  const newAccessToken = response.cookies.get('id');
  const newRefreshToken = response.cookies.get('rid');

  if (newAccessToken && newRefreshToken) {
    response.cookies.set('id', newAccessToken.value, cookieOpts);
    response.cookies.set('rid', newRefreshToken.value, cookieOpts);
  }

  return response;
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
