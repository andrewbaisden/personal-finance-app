import arcjet, {
  tokenBucket,
  shield,
  detectBot,
  fixedWindow,
  protectSignup,
} from '@arcjet/next';

// Re-export the rules to simplify imports inside handlers
export { detectBot, fixedWindow, protectSignup, shield, tokenBucket };

// Initialize Arcjet with configuration
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['fingerprint'],

  rules: [
    shield({
      mode: 'LIVE', // Actively block suspicious behavior
    }),

    tokenBucket({
      mode: 'LIVE', // Will block requests, use "DRY_RUN" to log only
      refillRate: 5, // Refill 5 tokens every interval
      interval: 10, // Interval in seconds for refilling tokens
      capacity: 10, // Maximum capacity of the token bucket
    }),
  ],
});

export default aj;
