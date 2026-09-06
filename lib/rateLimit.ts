/**
 * ─── Rate Limiter (Upstash Redis) ──────────────────────────────────────────
 * Provides a rate limiter factory using @upstash/ratelimit.
 * Falls back gracefully (no-op) if Redis credentials are not configured,
 * so the app still works locally without Redis.
 *
 * Usage:
 *   const { success, reset } = await authLimiter.limit(identifier);
 *   if (!success) throw new AppError("Too many attempts — try again later", 429);
 */
import { config } from "./config";
import { AppError } from "./AppError";

interface LimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp when the limit resets
}

interface Limiter {
  limit(identifier: string): Promise<LimitResult>;
}

/** No-op limiter used when Redis is not configured (local dev). */
const noopLimiter: Limiter = {
  limit: async () => ({ success: true, remaining: 999, reset: 0 }),
};

let _authLimiter: Limiter | null = null;
let _apiLimiter: Limiter | null = null;

function createLimiter(requests: number, windowSeconds: number): Limiter {
  if (!config.UPSTASH_REDIS_REST_URL || !config.UPSTASH_REDIS_REST_TOKEN) {
    return noopLimiter;
  }

  try {
    // Dynamic import avoids crash if package is missing during scaffold
    const { Ratelimit } = require("@upstash/ratelimit");
    const { Redis } = require("@upstash/redis");

    const redis = new Redis({
      url: config.UPSTASH_REDIS_REST_URL,
      token: config.UPSTASH_REDIS_REST_TOKEN,
    });

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, `${windowSeconds}s`),
      analytics: false,
    });

    return {
      limit: (identifier: string) => limiter.limit(identifier),
    };
  } catch {
    return noopLimiter;
  }
}

/** Rate limiter for auth endpoints (register, login, forgot-password). */
export function getAuthLimiter(): Limiter {
  if (!_authLimiter) {
    _authLimiter = createLimiter(
      config.AUTH_RATE_LIMIT_REQUESTS,
      config.AUTH_RATE_LIMIT_WINDOW_SECONDS
    );
  }
  return _authLimiter;
}

/** General API rate limiter (looser limits). */
export function getApiLimiter(): Limiter {
  if (!_apiLimiter) {
    _apiLimiter = createLimiter(200, 900); // 200 req / 15 min
  }
  return _apiLimiter;
}

/**
 * Convenience helper: throws AppError(429) if limit is exceeded.
 * @param identifier  Usually the IP address or userId
 * @param limiter     Which limiter to use
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Limiter = getAuthLimiter()
): Promise<void> {
  const result = await limiter.limit(identifier);
  if (!result.success) {
    throw new AppError("Too many requests — please try again later", 429);
  }
}
