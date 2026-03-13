const RATE_LIMIT_STORE_KEY = '__boda_rate_limit_store__';

const getStore = () => {
  if (!globalThis[RATE_LIMIT_STORE_KEY]) {
    globalThis[RATE_LIMIT_STORE_KEY] = new Map();
  }

  return globalThis[RATE_LIMIT_STORE_KEY];
};

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0].split(',')[0].trim();
  }

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
};

const cleanupExpiredEntries = (store, now) => {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
};

export const checkRateLimit = ({ req, keyPrefix, limit, windowMs, identifier = 'anon' }) => {
  const store = getStore();
  const now = Date.now();
  const ip = getClientIp(req);
  const key = `${keyPrefix}:${ip}:${identifier}`;

  cleanupExpiredEntries(store, now);

  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const nextEntry = {
      count: 1,
      resetAt: now + windowMs
    };

    store.set(key, nextEntry);

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt: nextEntry.resetAt
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt
  };
};

export const applyRateLimitHeaders = (res, rateLimitResult, limit) => {
  const retryAfterSeconds = Math.max(1, Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));

  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(rateLimitResult.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.floor(rateLimitResult.resetAt / 1000)));

  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', String(retryAfterSeconds));
  }
};
