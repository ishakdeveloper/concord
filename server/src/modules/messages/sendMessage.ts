import { z } from 'zod';
import { protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import db from '../../database/db';
import { messages, channels, conversations } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { cacheUtils } from '../../utils/cacheUtils';

export const sendMessage = protectedProcedure
  .input(
    z
      .object({
        content: z.string().min(1),
        conversationId: z.string().optional(),
        channelId: z.string().optional(),
      })
      .refine((data) => data.conversationId || data.channelId, {
        message: 'Either conversationId or channelId must be provided',
      })
  )
  .mutation(async ({ input, ctx }) => {
    const { content, conversationId, channelId } = input;
    const { user } = ctx;

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to send messages',
      });
    }

    // Check access rights
    if (conversationId) {
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
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

      const isParticipant = conversation.participants.some(
        (p) => p.userId === user.id
      );

      if (!isParticipant) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this conversation',
        });
      }
    } else if (channelId) {
      const channel = await db.query.channels.findFirst({
        where: eq(channels.id, channelId),
        with: {
          guild: {
            with: {
              members: true,
            },
          },
        },
      });

      if (!channel) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Channel not found',
        });
      }

      const isMember = channel.guild.members.some((m) => m.userId === user.id);

      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have access to this channel',
        });
      }
    }

    // Create the message
    const [newMessage] = await db
      .insert(messages)
      .values({
        content,
        authorId: user.id,
        conversationId,
        channelId,
      })
      .returning();

    if (conversationId) {
      await cacheUtils.clearMessageCache(conversationId);
      await cacheUtils.clearSingleConversationCache(conversationId);
    } else if (channelId) {
      await cacheUtils.clearMessageCache(undefined, channelId);
    }

    return newMessage;
  });
