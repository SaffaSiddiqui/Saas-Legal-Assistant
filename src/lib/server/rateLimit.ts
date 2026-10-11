/**
 * A very small in-memory rate limiter (fixed window).
 *
 * Good enough for one server process, such as local development. On serverless
 * hosts each request may run in a different process, so before a public launch
 * replace this with a shared store (for example Upstash Redis).
 */

interface Entry {
  count: number;
  resetAt: number;
}

const entries = new Map<string, Entry>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  now: number = Date.now(),
): RateLimitResult {
  // Drop expired entries now and then so the map cannot grow forever.
  if (entries.size > 1000) {
    for (const [entryKey, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(entryKey);
    }
  }

  const current = entries.get(key);
  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true };
}

/** Test helper: forget all counters. */
export function resetRateLimits(): void {
  entries.clear();
}
