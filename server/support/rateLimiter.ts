/**
 * In-Memory Sliding Window Rate Limiter
 * Limits incoming support chat requests per client IP / identifier.
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private clients: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: { windowMs?: number; maxRequests?: number } = {}) {
    this.windowMs = options.windowMs || 60 * 1000; // 1 minute default
    this.maxRequests = options.maxRequests || 20; // 20 requests per minute default

    // Periodically prune stale clients
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs * 2);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Check if client exceeds limit, and record current request if allowed.
   */
  public checkLimit(clientId: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.clients.get(clientId);
    if (!record) {
      record = { timestamps: [] };
      this.clients.set(clientId, record);
    }

    // Filter out timestamps outside the sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldest = record.timestamps[0] || now;
      const resetMs = Math.max(0, oldest + this.windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    record.timestamps.push(now);
    const remaining = this.maxRequests - record.timestamps.length;
    return {
      allowed: true,
      remaining,
      resetMs: this.windowMs,
    };
  }

  /**
   * Reset limits for a specific client (useful for tests)
   */
  public reset(clientId?: string): void {
    if (clientId) {
      this.clients.delete(clientId);
    } else {
      this.clients.clear();
    }
  }

  /**
   * Cleanup resources when destroying limiter
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clients.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [clientId, record] of this.clients.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.clients.delete(clientId);
      }
    }
  }
}

// Default singleton limiter for chat endpoint: 25 requests per minute
export const supportRateLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 25,
});
