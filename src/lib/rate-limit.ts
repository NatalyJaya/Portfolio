/**
 * Simple in-memory rate limiter for API routes.
 * Works for single-instance dev and small deployments.
 * For serverless at scale, use Redis (e.g. @upstash/ratelimit) so limits apply across instances.
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

function prune(now: number) {
  if (store.size < 500) return;
  store.forEach((b, key) => {
    if (now > b.resetAt) store.delete(key);
  });
}

export function rateLimit(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  prune(now);

  let bucket = store.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 1, resetAt: now + WINDOW_MS };
    store.set(key, bucket);
    return { ok: true };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}
