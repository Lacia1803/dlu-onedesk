export const cache = new Map<string, { value: unknown; expires: number }>();

// Dọn các entry hết hạn để tránh phình bộ nhớ (memory DoS).
let lastPrune = 0;
function pruneExpired(now: number) {
  // Chỉ quét tối đa 1 lần/giây để không ảnh hưởng hiệu năng đường nóng.
  if (now - lastPrune < 1000 && cache.size < 1000) return;
  lastPrune = now;
  for (const [key, entry] of cache) {
    if (entry.expires < now) cache.delete(key);
  }
}

/**
 * In-memory cache with TTL (ms) + Upstash Redis REST fallback.
 * Mặc định dùng Map đơn tiến trình; bật Upstash REST khi set env
 * UPSTASH_REDIS_REST_URL để dùng chung giữa nhiều instance.
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
  pruneExpired(now);
  const entry = cache.get(key);
  if (entry && entry.expires > now) return entry.value as T;
  const result = await fn();
  cache.set(key, { value: result, expires: now + ttlMs });
  return result;
}

/**
 * Rate limiter theo key (IP hoặc userId).
 * - Mặc định: bộ đếm in-memory, phù hợp 1 instance. KHÔNG hiệu lực khi chạy
 *   nhiều instance/serverless — bật Upstash REST để dùng chung toàn cụm.
 * - Khi set UPSTASH_REDIS_REST_URL + _TOKEN: dùng Redis INCR + PEXPIRE (cửa sổ cố định).
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const redisKey = `ratelimit:${key}`;
      const headers = { Authorization: `Bearer ${token}` };
      const incrRes = await fetch(`${url}/incr/${encodeURIComponent(redisKey)}`, { headers });
      const incrData = await incrRes.json();
      const count = Number(incrData?.result ?? 0);
      if (count === 1) {
        await fetch(`${url}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, { headers });
      }
      return { allowed: count <= limit };
    } catch {
      // Fallback sang bộ đếm in-memory nếu Upstash lỗi.
    }
  }

  const now = Date.now();
  pruneExpired(now);
  const entry = cache.get(key);
  if (!entry || entry.expires < now) {
    cache.set(key, { value: 1, expires: now + windowMs });
    return { allowed: true };
  }
  const count = (entry.value as number) + 1;
  entry.value = count;
  return { allowed: count <= limit };
}
