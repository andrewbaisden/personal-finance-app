import arcjet, { tokenBucket } from '@arcjet/next';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Initialize Arcjet for the signup route
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['ip'], // Identify users by their IP address for signup rate limiting
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
  // Apply Arcjet protection to the signup route
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

  // Proceed with signup logic
  const { name, email, password } = await req.json();
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accountNumber: `ACC${Math.floor(Math.random() * 1000000)}`,
      },
    });
    return NextResponse.json({ message: 'User created successfully!' });
  } catch (error) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }
}
