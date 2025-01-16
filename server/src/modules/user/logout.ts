import { protectedProcedure } from '../../trpc';
import {
  clearAuthCookies,
  incrementTokenVersion,
} from '../../utils/createAuthTokens';

export const logout = protectedProcedure.mutation(async ({ ctx }) => {
  if (ctx.user) {
    // Increment token version to invalidate existing refresh tokens
    await incrementTokenVersion(ctx.user.id);
  }

  // Clear auth cookies
  clearAuthCookies(ctx.res);

  return { success: true };
});
