import db from '../../database/db';
import {
  conversationParticipants,
  conversations,
  messages,
} from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { users as UserTable } from '../../database/schema';
import { eq } from 'drizzle-orm';

export const createGroup = protectedProcedure
  .input(
    z.object({
      participantIds: z.array(z.string()),
      name: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { participantIds, name } = input;
    const allParticipants = [...new Set([...participantIds, user?.id])];

    if (allParticipants.length < 3) {
      throw new Error('Group conversations must have at least 3 participants');
    }

    const result = await db.transaction(async (tx) => {
      const [conversation] = await tx
        .insert(conversations)
        .values({
          isGroup: true,
          name: name || 'Group Chat',
        })
        .returning();

      await tx.insert(conversationParticipants).values(
        allParticipants.map((userId) => ({
          conversationId: conversation.id,
          userId: userId ?? '',
        }))
      );

      await tx.insert(messages).values({
        content: `${user?.name} has created a group.`,
        authorId: user?.id ?? '',
        isSystem: true,
        conversationId: conversation.id,
      });

      const participants = await tx
        .select({
          participant: {
            id: conversationParticipants.id,
            userId: conversationParticipants.userId,
            conversationId: conversationParticipants.conversationId,
            joinedAt: conversationParticipants.joinedAt,
          },
          user: {
            id: UserTable.id,
            name: UserTable.name,
            email: UserTable.email,
            image: UserTable.image,
          },
        })
        .from(conversationParticipants)
        .leftJoin(UserTable, eq(conversationParticipants.userId, UserTable.id))
        .where(eq(conversationParticipants.conversationId, conversation.id));

      return {
        id: conversation.id,
        name: conversation.name,
        isGroup: true,
        createdAt: conversation.createdAt,
        participants: participants
          .filter((p) => p.user !== null)
          .map((p) => ({
            id: p.participant.id,
            userId: p.participant.userId,
            conversationId: p.participant.conversationId,
            joinedAt: p.participant.joinedAt,
            user: p.user!,
          })),
      };
    });

    return result;
  });
