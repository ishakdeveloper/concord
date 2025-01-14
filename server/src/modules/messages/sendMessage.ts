import db from '../../database/db';
import { messages } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const sendMessage = protectedProcedure
  .input(
    z
      .object({
        conversationId: z.string().optional(),
        guildId: z.string().optional(),
        content: z.string(),
      })
      .refine((data) => data.conversationId || data.guildId, {
        message: 'Either conversationId or guildId must be provided',
      })
  )
  .mutation(async ({ input, ctx }) => {
    const { conversationId, guildId, content } = input;
    const { user } = ctx;

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to send messages',
      });
    }

    if (conversationId) {
      // Check if user has access to this conversation
      const conversation = await db.query.conversations.findFirst({
        where: (conversations, { eq }) => eq(conversations.id, conversationId),
        with: {
          participants: true,
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      // Check if user is a participant in this conversation
      const isParticipant = conversation.participants.some(
        (participant) => participant.userId === user.id
      );

      if (!isParticipant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this conversation',
        });
      }

      return await db.insert(messages).values({
        content,
        authorId: user.id,
        conversationId,
      });
    } else {
      // For guild messages, just insert without checking access
      return await db.insert(messages).values({
        content,
        authorId: user.id,
        conversationId: guildId, // Using conversationId field for guildId
      });
    }
  });
