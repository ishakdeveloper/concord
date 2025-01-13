import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { and } from 'drizzle-orm';
import db from '../../database/db';
import { conversationParticipants, messages } from '../../database/schema';
import { eq } from 'drizzle-orm';

export const leaveGroup = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { conversationId } = input;
    const { user } = ctx;

    return await db.transaction(async (tx) => {
      // Check if conversation exists and is a group
      const conversation = await tx.query.conversations.findFirst({
        where: (conversations, { eq }) => eq(conversations.id, conversationId),
      });

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      if (!conversation.isGroup) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only leave group conversations',
        });
      }

      // Delete participant record
      const result = await tx
        .delete(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, user?.id ?? '')
          )
        );

      if (result.rowCount === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not a participant in this conversation',
        });
      }

      // Add system message about user leaving
      await tx.insert(messages).values({
        content: `${user?.name} left the group`,
        authorId: user?.id ?? '',
        isSystem: true,
        conversationId: conversationId,
      });

      return { message: 'Left conversation successfully' };
    });
  });
