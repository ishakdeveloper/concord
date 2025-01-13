import { initTRPC, TRPCError } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { checkTokens } from './utils/createAuthTokens';
import { sendAuthCookies } from './utils/createAuthTokens';
import superjson from 'superjson';
import { DbUser } from './database/schema';

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  let userId = '';
  let user: DbUser | null = null;

  // Check for auth tokens
  if (req.cookies.id && req.cookies.rid) {
    const { id, rid } = req.cookies;
    const tokens = await checkTokens(id, rid);
    userId = tokens.userId;
    user = tokens.user ?? null;
  }

  return {
    req,
    res,
    userId,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.req.cookies.id && !ctx.req.cookies.rid) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const { id, rid } = ctx.req.cookies;

  const { userId, user = null } = await checkTokens(id, rid);

  ctx.userId = userId;
  ctx.user = user;
  if (user) {
    sendAuthCookies(ctx.res, user);
  }

  return opts.next(opts);
});
