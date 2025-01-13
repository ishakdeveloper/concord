import { publicProcedure } from '../../trpc';
import { clearAuthCookies } from '../../utils/createAuthTokens';

export const logout = publicProcedure.mutation(async ({ ctx }) => {
  clearAuthCookies(ctx.res);

  return {
    ok: true,
  };
});
