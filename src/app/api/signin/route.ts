import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import arcjet, { detectBot } from '@arcjet/next';

const prisma = new PrismaClient();

// Initialize Arcjet with bot detection rule
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['fingerprint'],
  rules: [
    detectBot({
      mode: 'LIVE', // Block automated clients
      block: ['AUTOMATED'], // Specifically block requests identified as automated
    }),
  ],
});

export async function POST(req: Request) {
  // Retrieve the IP address from the request headers
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'; // Fallback to localhost IP in case none are found

  // Apply Arcjet protection using the IP address as part of the fingerprint
  const decision = await aj.protect(req, { fingerprint: ip });
  console.log('Arcjet decision: ', decision);

  if (decision.isDenied()) {
    // If the request is blocked, return a 403 Forbidden response
    return NextResponse.json(
      { error: 'Forbidden: Automated client detected', ip: decision.ip },
      { status: 403 }
    );
  }

  // Proceed with the usual login logic if not blocked
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '1h',
  });

  return NextResponse.json({ token });
}
