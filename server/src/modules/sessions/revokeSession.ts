import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { sessions } from '../../database/schema/users';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { revokeSession } from '../../utils/createAuthTokens';

export const revokeSingleSession = protectedProcedure
  .input(z.object({ sessionId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
    }

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.id, input.sessionId),
    });

    if (!session || session.userId !== ctx.user.id) {
      throw new Error('Session not found');
    }

    await revokeSession(input.sessionId);
    return { success: true };
  });
