import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { sessions } from '../../database/schema/users';
import { protectedProcedure } from '../../trpc';

export const getActiveSessions = protectedProcedure.query(async ({ ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
  }

  const userSessions = await db.query.sessions.findMany({
    where: eq(sessions.userId, ctx.user.id),
    orderBy: (sessions, { desc }) => [desc(sessions.lastActive)],
  });

  return userSessions.filter((session) => !session.isRevoked);
});
