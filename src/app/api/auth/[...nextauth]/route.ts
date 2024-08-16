import arcjet, { tokenBucket } from '@arcjet/next';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize Arcjet for the auth route
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['ip'], // Identify users by their IP address for login rate limiting
  rules: [
    tokenBucket({
      mode: 'LIVE', // LIVE mode will block requests
      refillRate: 5, // Refill 5 tokens every interval
      interval: 10, // Interval in seconds for refilling tokens
      capacity: 10, // Maximum capacity of the token bucket
    }),
  ],
});

export async function POST(req: Request) {
  // Apply Arcjet protection to the login route
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown-ip';
  const decision = await aj.protect(req, { ip, requested: 5 });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Too Many Requests', reason: decision.reason },
      { status: 429 }
    );
  }

  // Proceed with login logic
  const { email, password } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });

      return NextResponse.json({ token });
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
