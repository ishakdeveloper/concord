import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { checkTokens, sendAuthCookies } from './utils/createAuthTokens';
import superjson from 'superjson';
import type { DbUser } from './database/schema';
import { CacheOptions, createCacheMiddleware } from './middleware/cache';
import chalk from 'chalk';

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

// Add logger function
const loggerMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;
  const userId = ctx.user?.id || 'anonymous';

  const status = result.ok ? chalk.green('OK') : chalk.red('ERROR');
  const method =
    type === 'query' ? chalk.blue('QUERY') : chalk.yellow('MUTATION');

  console.log(
    `${method} ${chalk.cyan(path)} - ${status} ${chalk.gray(`${durationMs}ms`)} - User: ${userId}`
  );

  return result;
});

// Apply logger to all procedures
export const publicProcedure = t.procedure.use(loggerMiddleware);
export const protectedProcedure = t.procedure
  .use(loggerMiddleware)
  .use(async (opts) => {
    const { ctx } = opts;
    if (!ctx.req.cookies.rid) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    try {
      // Try to verify the access token first
      const accessToken = ctx.req.cookies.id;
      const refreshToken = ctx.req.cookies.rid;
      let result;

      if (accessToken) {
        try {
          result = await checkTokens(accessToken, refreshToken);
        } catch (err) {
          // If access token verification fails, try refresh flow
          result = await checkTokens('', refreshToken);
        }
      } else {
        // No access token, try refresh flow directly
        result = await checkTokens('', refreshToken);
      }

      if (!result.user || !result.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      ctx.userId = result.userId;
      ctx.user = result.user;
      ctx.sessionId = result.sessionId;

      // Always set new tokens if they were generated
      if (result.tokens) {
        sendAuthCookies(ctx.res, result.tokens);
      }

      return opts.next(opts);
    } catch (error) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
  });

// Helper for creating cached procedures
export const createCachedProcedure = (options: CacheOptions = {}) => {
  return protectedProcedure.use(
    createCacheMiddleware({ ...options, protected: true })
  );
};
