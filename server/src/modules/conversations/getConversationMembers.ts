import { eq } from 'drizzle-orm';
import db from '../../database/db';
import {
  conversationParticipants,
  users as UserTable,
} from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const getConversationMembers = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { conversationId } = input;
    const participants = await db
      .select({
        id: conversationParticipants.id,
        userId: conversationParticipants.userId,
        conversationId: conversationParticipants.conversationId,
        joinedAt: conversationParticipants.joinedAt,
        user: {
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          image: UserTable.image,
        },
      })
      .from(conversationParticipants)
      .leftJoin(UserTable, eq(conversationParticipants.userId, UserTable.id))
      .where(eq(conversationParticipants.conversationId, conversationId))
      .execute();

    return {
      participants: participants
        .filter((p) => p.user !== null)
        .map((p) => ({
          ...p,
          user: p.user!,
        })),
    };
  });
