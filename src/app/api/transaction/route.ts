import arcjet, { tokenBucket } from '@arcjet/next';
import { NextResponse } from 'next/server';

const getIpAddress = (req: Request) => {
  // In development, use a default value if IP is unavailable
  return (
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'localhost'
  );
};

// Initialize Arcjet with your API key and token bucket rule
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Replace with your Arcjet site key
  characteristics: ['ip'], // Identify users by their user ID
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
  const ip = getIpAddress(req); // Use the method to get IP address
  const decision = await aj.protect(req, { ip, requested: 5 });

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Too Many Requests', reason: decision.reason },
      { status: 429 }
    );
  }

  // Continue with your transaction logic here
  // For demonstration purposes, we'll just return a success message
  return NextResponse.json({ message: 'Transaction successful!' });
}
