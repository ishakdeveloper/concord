import { and, eq } from 'drizzle-orm';
import db from '../../database/db';
import { conversationParticipants, messages } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const joinGroup = protectedProcedure
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
          message: 'Can only join group conversations',
        });
      }

      // Check if already a participant
      const existingParticipant = await tx
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, user?.id ?? '')
          )
        )
        .limit(1);

      if (existingParticipant[0]) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Already a participant in this conversation',
        });
      }

      // Add user as participant
      await tx.insert(conversationParticipants).values({
        conversationId: conversationId,
        userId: user?.id ?? '',
      });

      // Add system message about user joining
      await tx.insert(messages).values({
        content: `${user?.name} joined the group`,
        authorId: user?.id ?? '',
        isSystem: true,
        conversationId: conversationId,
      });

      return { message: 'Joined conversation successfully' };
    });
  });
