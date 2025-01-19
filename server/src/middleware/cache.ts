import { middleware } from '../trpc';
import { redis } from '../services/redis';
import { TRPCError } from '@trpc/server';
import { createHash } from 'crypto';

export interface CacheOptions {
  key?: string;
  protected?: boolean;
}

const generateHash = (data: any): string => {
  const cleanData = JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (key === 'req' || key === 'res' || typeof value === 'function') {
        return undefined;
      }
      return value;
    })
  );
  return createHash('sha256').update(JSON.stringify(cleanData)).digest('hex');
};

let cacheHits = 0;
let cacheMisses = 0;

export const getCacheMetrics = () => ({
  hits: cacheHits,
  misses: cacheMisses,
  hitRate: cacheHits / (cacheHits + cacheMisses || 1),
});

export const createCacheMiddleware = (options: CacheOptions = {}) => {
  const { key = '', protected: isProtected = false } = options;

  return middleware(async ({ ctx, path, input, next }) => {
    if (ctx.req.method !== 'GET') {
      return next();
    }

    if (isProtected && !ctx.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    try {
      // Clean input for cache key
      const cleanInput = input ? JSON.stringify(input) : '';
      const cacheKey = `trpc:${key}:${path}:${isProtected ? ctx.userId : ''}:${cleanInput}`;

      console.log('[Cache] Attempting to fetch:', {
        path,
        cacheKey,
        hasUserId: !!ctx.userId,
      });

      const cached = await redis.get(cacheKey);
      if (cached) {
        cacheHits++;
        console.log('[Cache] HIT:', { path, cacheKey });
        const { data } = JSON.parse(cached);

        console.log('[Cache] Returning cached data:', {
          path,
          dataSize: JSON.stringify(data).length,
          timestamp: new Date().toISOString(),
        });

        return data;
      }

      cacheMisses++;
      console.log('[Cache] MISS:', { path, cacheKey });

      const result = await next();
      const cleanResult = JSON.parse(
        JSON.stringify(result, (key, value) => {
          if (key === 'req' || key === 'res' || typeof value === 'function') {
            return undefined;
          }
          return value;
        })
      );

      await redis.set(
        cacheKey,
        JSON.stringify({
          data: cleanResult,
          hash: generateHash(result),
        }),
        'EX',
        300 // 5 minutes TTL
      );

      console.log('[Cache] Stored new data:', {
        path,
        dataSize: JSON.stringify(cleanResult).length,
        ttl: 300,
      });

      return result;
    } catch (error) {
      console.error('[Cache] Error:', error);
      return next();
    }
  });
};
