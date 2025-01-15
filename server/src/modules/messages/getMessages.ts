import { z } from 'zod';
import { protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import db from '../../database/db';
import { messages, conversations, channels } from '../../database/schema';
import { and, desc, eq } from 'drizzle-orm';

export const getMessages = protectedProcedure
  .input(
    z
      .object({
        conversationId: z.string().optional(),
        channelId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(), // For pagination
      })
      .refine((data) => data.conversationId || data.channelId, {
        message: 'Either conversationId or channelId must be provided',
      })
  )
  .query(async ({ input, ctx }) => {
    const { conversationId, channelId, limit, cursor } = input;
    const { user } = ctx;

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to fetch messages',
      });
    }

    // Check access rights
    if (conversationId) {
      // For conversations, check if user is a participant
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
      // For guild channels, check if user is a member of the guild
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

    // Build query conditions
    const conditions = conversationId
      ? eq(messages.conversationId, conversationId)
      : eq(messages.channelId, channelId!);

    // Add cursor condition if provided
    const cursorCondition = cursor
      ? and(conditions, desc(messages.createdAt))
      : conditions;

    // Fetch messages
    const messagesList = await db.query.messages.findMany({
      where: cursorCondition,
      limit: limit + 1, // Get one extra to check if there are more
      orderBy: desc(messages.createdAt),
      with: {
        author: true,
      },
    });

    let nextCursor: string | undefined = undefined;
    if (messagesList.length > limit) {
      const nextItem = messagesList.pop();
      nextCursor = nextItem?.id;
    }

    return {
      messages: messagesList,
      nextCursor,
    };
  });
