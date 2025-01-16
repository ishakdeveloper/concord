import { and, sql } from 'drizzle-orm';

import { sessions } from '../../database/schema/users';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const revokeAllSessions = protectedProcedure
  .input(z.object({ currentSessionId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
    }

    await db
      .update(sessions)
      .set({
        isRevoked: true,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(sessions.userId, ctx.user.id),
          sql`id != ${input.currentSessionId}`
        )
      );

    return { success: true };
  });
