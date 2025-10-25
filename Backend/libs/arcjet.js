import arcjet, { detectBot, shield, tokenBucket, validateEmail } from "@arcjet/node";



const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  rules: [
     shield({
      mode: "LIVE",
    }),
    detectBot({
   mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
   // Block all bots except specific Google and Bing crawlers, and curl
   allow: [
      "GOOGLE_CRAWLER",
      "GOOGLE_CRAWLER_NEWS",
      "BING_CRAWLER",
      "CURL",
   ],
}),// Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      refillRate: 5, // refill 5 tokens per interval
      interval: 10, // refill every 10 seconds
      capacity: 10, // bucket maximum capacity of 10 tokens
    }),
    validateEmail({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // block disposable, invalid, and email addresses with no MX records
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
  ],
});

export default aj