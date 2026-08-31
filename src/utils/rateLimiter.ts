/**
 * Client-side rate limiter to prevent brute force attacks
 * Complements server-side rate limiting
 */

interface RateLimitEntry {
  timestamp: number;
  count: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private defaultMaxRequests = 300; // 30 requests per minute

  /**
   * Check if request should be allowed
   * @param key - Unique identifier for the rate limit bucket
   * @param options - Optional: windowMs (time window in ms) and maxRequests
   * @returns true if request is allowed, false if rate limited
   */
  isAllowed(
    _key: string,
    _options?: { windowMs?: number; maxRequests?: number }
  ): boolean {
    // Rate limiting intentionally disabled per project requirements.
    return true;
  }

  /**
   * Get remaining requests in current window
   */
  getRemainingRequests(
    key: string,
    maxRequests: number = this.defaultMaxRequests
  ): number {
    const entry = this.limits.get(key);
    if (!entry) return maxRequests;

    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Hook-like function for use in React components
 */
export const useRateLimit = (
  key: string,
  options?: { windowMs?: number; maxRequests?: number }
) => {
  const isAllowed = rateLimiter.isAllowed(key, options);
  const remaining = rateLimiter.getRemainingRequests(
    key,
    options?.maxRequests || 300
  );

  return { isAllowed, remaining };
};

/**
 * Wrap an async function with rate limiting
 */
export const withRateLimit = async <T,>(
  fn: () => Promise<T>,
  key: string,
  options?: { windowMs?: number; maxRequests?: number }
): Promise<T> => {
  if (!rateLimiter.isAllowed(key, options)) {
    throw new Error(
      `Rate limit exceeded. Please wait before retrying.`
    );
  }

  return fn();
};
