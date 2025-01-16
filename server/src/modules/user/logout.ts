import { protectedProcedure } from '../../trpc';
import { clearAuthCookies, revokeSession } from '../../utils/createAuthTokens';

export const logout = protectedProcedure.mutation(async ({ ctx }) => {
  if (ctx.user) {
    // Revoke only current session instead of all
    await revokeSession(ctx.sessionId);
  }

  // Clear auth cookies for web
  if (ctx.req.headers['x-app-platform'] !== 'mobile') {
    clearAuthCookies(ctx.res);
  }

  return { success: true };
});
