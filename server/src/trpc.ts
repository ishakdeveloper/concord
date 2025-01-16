import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { checkTokens, sendAuthCookies } from './utils/createAuthTokens';
import superjson from 'superjson';
import type { DbUser } from './database/schema';
import { CacheOptions, createCacheMiddleware } from './middleware/cache';

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  let userId = '';
  let user: DbUser | null = null;
  let sessionId = '';

  // Check for auth tokens
  if (req.cookies.id && req.cookies.rid) {
    const { id, rid } = req.cookies;
    const result = await checkTokens(id, rid);
    userId = result.userId;
    user = result.user ?? null;
    sessionId = result.sessionId;

    // Set new tokens if they were rotated
    if (result.tokens) {
      sendAuthCookies(res, result.tokens);
    }
  }

  return {
    req,
    res,
    userId,
    user,
    sessionId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.req.cookies.id || !ctx.req.cookies.rid) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const { id, rid } = ctx.req.cookies;
  const result = await checkTokens(id, rid);

  if (!result.user || !result.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  ctx.userId = result.userId;
  ctx.user = result.user;
  ctx.sessionId = result.sessionId;

  // Only set cookies if tokens were rotated
  if (result.tokens) {
    sendAuthCookies(ctx.res, result.tokens);
  }

  return opts.next(opts);
});

// Helper for creating cached procedures
export const createCachedProcedure = (options: CacheOptions = {}) => {
  return protectedProcedure.use(
    createCacheMiddleware({ ...options, protected: true })
  );
};
