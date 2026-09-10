export const cache = new Map<string, { value: any; expires: number }>();

/**
 * Simple in‑memory cache with TTL (ms).
 * Returns cached value if not expired, otherwise computes via `fn` and stores it.
 * Usage: `await cached("rooms", 5 * 60 * 1000, () => db.room.findMany())`.
 */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && entry.expires > now) return entry.value as T;
  const result = await fn();
  cache.set(key, { value: result, expires: now + ttlMs });
  return result;
}

/**
 * Basic per‑key rate limiter.
 * `key` usually `${userId}:${action}`.
 * Allows `limit` calls per `windowMs`.
 * Returns true if allowed, false if limit exceeded.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = cache.get(key);
  if (!entry || entry.expires < now) {
    // reset window
    cache.set(key, { value: 1, expires: now + windowMs });
    return true;
  }
  if ((entry.value as number) < limit) {
    entry.value = (entry.value as number) + 1;
    return true;
  }
  return false;
}
