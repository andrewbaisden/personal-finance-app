import arcjet, { tokenBucket } from '@arcjet/next';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize Arcjet for the auth route
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: process.env.NODE_ENV === 'development' ? [] : ['ip'], // Skip IP characteristic in development
  rules: [
    tokenBucket({
      mode: 'LIVE',
      refillRate: 5, // refill 5 tokens per interval
      interval: 30, // refill every 30 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens

      // Users can only sign in two times and then they have to wait 30 seconds before they can try again each time
    }),
  ],
});

export async function POST(req: Request) {
  // Apply Arcjet protection to the login route
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'; // Fallback to 127.0.0.1 or another mock IP in development

  const decision = await aj.protect(req, {
    ip,
    requested: 5,
  });

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
