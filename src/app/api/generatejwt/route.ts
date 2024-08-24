import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    // Validate that userId is a number
    if (typeof userId !== 'number') {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
