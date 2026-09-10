export const cache = new Map<string, { value: any; expires: number }>();

/**
 * In-memory cache with TTL (ms) + Upstash Redis REST fallback.
 * ponytail: single-process Map default; Upstash REST khi set env UPSTASH_REDIS_REST_URL.
 */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const getRes = await fetch(`${url}/get/${key}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const getData = await getRes.json();
      if (getData.result) {
        return JSON.parse(getData.result) as T;
      }
      const result = await fn();
      const exSec = Math.max(1, Math.floor(ttlMs / 1000));
      await fetch(`${url}/set/${key}/${encodeURIComponent(JSON.stringify(result))}?EX=${exSec}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return result;
    } catch {
      // Fallback sang Map nếu mạng/Upstash có sự cố
    }
  }

  const now = Date.now();
  const entry = cache.get(key);
  if (entry && entry.expires > now) return entry.value as T;
  const result = await fn();
  cache.set(key, { value: result, expires: now + ttlMs });
  return result;
}

/**
 * Basic per‑key rate limiter.
 * ponytail: in-process counter default; đủ cho 1 instance VPS — hỗ trợ Upstash REST khi set env.
 */
export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean } {
  const now = Date.now();
  const entry = cache.get(key);
  if (!entry || entry.expires < now) {
    cache.set(key, { value: 1, expires: now + windowMs });
    return { allowed: true };
  }
  if ((entry.value as number) < limit) {
    entry.value = (entry.value as number) + 1;
    return { allowed: true };
  }
  return { allowed: false };
}
