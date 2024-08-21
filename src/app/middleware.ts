// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');
  const url = req.nextUrl.clone();

  // Redirect to transaction page if already signed in and trying to access the sign-in page
  if (token && url.pathname === '/signin') {
    url.pathname = '/transaction';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/signin', '/transaction/:path*'], // Apply middleware to sign-in and transaction routes
};
