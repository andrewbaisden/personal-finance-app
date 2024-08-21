import arcjet, { tokenBucket, shield } from '@arcjet/next';

// Initialize Arcjet with configuration
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['fingerprint'],
  rules: [
    shield({
      mode: 'LIVE', // Actively block suspicious behavior
    }),
    tokenBucket({
      mode: 'LIVE', // will block requests, use "DRY_RUN" to log only
      refillRate: 5, // refill 5 tokens every interval
      interval: 10, // interval in seconds for refilling tokens
      capacity: 10, // maximum capacity of the token bucket
    }),
  ],
});

export default aj;
