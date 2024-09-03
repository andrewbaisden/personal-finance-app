import { NextResponse, NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import arcjet, { detectBot } from '@arcjet/next';

const prisma = new PrismaClient();

// Initialize Arcjet with bot detection rule
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: 'LIVE', // Block automated clients
      block: ['AUTOMATED'], // Specifically block requests identified as automated
    }),
  ],
});

export async function POST(req: NextRequest) {
  const decision = await aj.protect(req);
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
