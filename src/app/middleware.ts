import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import arcjet, { shield } from '@arcjet/next';

// Initialize Arcjet with shield protection
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['fingerprint'],
  rules: [
    shield({
      mode: 'LIVE', // Enforce live protection
    }),
  ],
});

export async function middleware(req: NextRequest) {
  // Extract the IP address or fingerprint from the request headers
  const fingerprint =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown-ip';

  // Apply Arcjet protection
  const decision = await aj.protect(req, { fingerprint });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Forbidden: Suspicious activity detected', ip: fingerprint },
      { status: 403 }
    );
  }

  // Existing middleware logic for handling sign-in redirection
  const token = req.cookies.get('token');
  const url = req.nextUrl.clone();

  if (token && url.pathname === '/signin') {
    url.pathname = '/transaction';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/signin', '/transaction/:path*'], // Apply middleware to these routes
};
