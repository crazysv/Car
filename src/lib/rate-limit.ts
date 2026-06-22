/**
 * In-Memory Rate Limiter
 * 
 * Note: In a serverless environment (like Vercel), this in-memory Map is NOT shared 
 * across different serverless instances or regions. Memory is also reset when 
 * instances spin down. 
 * 
 * This is a "best-effort" protection to stop aggressive scraping or rapid button-mashing
 * from a single user on a warm instance. It is not a mathematically perfect global rate limit.
 */

interface RateLimitInfo {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitInfo>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  
  // Cleanup periodically to prevent memory leaks in long-running instances
  if (store.size > 10000) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) {
        store.delete(k);
      }
    }
    // If still too large after cleanup, clear completely as a safety net
    if (store.size > 10000) {
      store.clear();
    }
  }

  const info = store.get(key);

  if (!info || now > info.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true; // Allowed
  }

  if (info.count >= limit) {
    return false; // Denied
  }

  info.count += 1;
  return true; // Allowed
}
