import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Generic rate limiter using Redis atomic counters (fixed window)
// keyParts: array to build unique key (e.g., ['auth', ip])
// limit: max requests in window
export const rateLimit = ({ keyParts, limit }) => async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const windowSeconds = env.rateLimit.windowSeconds;
    const key = ['rl', ...keyParts(ip)].join(':');

    if (!global.redis) {
      return next(); // fallback: skip if redis not ready
    }

    const count = await global.redis.incr(key);
    if (count === 1) {
      await global.redis.expire(key, windowSeconds);
    }
    if (count > limit) {
      const ttl = await global.redis.ttl(key);
      return next(new ApiError(429, 'Rate limit exceeded', { retryAfterSeconds: ttl }));
    }
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));
    next();
  } catch (err) {
    next(err);
  }
};

// Specialized middlewares
export const authRateLimit = rateLimit({
  keyParts: (ip) => ['auth', ip],
  limit: env.rateLimit.maxAuth
});

export const nonceRateLimit = rateLimit({
  keyParts: (ip) => ['nonce', ip],
  limit: env.rateLimit.maxNonce
});