import { and } from 'drizzle-orm';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import { conversationParticipants } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { conversations } from '../../database/schema';
import { users as UserTable } from '../../database/schema';

export const getSingleConversation = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { conversationId } = input;
    const { user } = ctx;

    const isParticipant = await db
      .select()
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, user?.id ?? '')
        )
      )
      .limit(1);

    if (!isParticipant.length) {
      throw new Error('Not authorized to view this conversation');
    }

    const [conv] = await db
      .select({
        id: conversations.id,
        name: conversations.name,
        isGroup: conversations.isGroup,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conv) {
      throw new Error('Conversation not found');
    }

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
      .where(eq(conversationParticipants.conversationId, conversationId));

    const filteredParticipants = participants
      .filter((p) => p.user !== null)
      .map((p) => ({
        id: p.id,
        userId: p.userId,
        conversationId: p.conversationId,
        joinedAt: p.joinedAt,
        user: {
          id: p.user!.id,
          name: p.user!.name,
          email: p.user!.email,
          image: p.user!.image,
        },
      }));

    return {
      id: conv.id,
      name: conv.name,
      isGroup: conv.isGroup,
      createdAt: conv.createdAt,
      participants: filteredParticipants,
    };
  });
