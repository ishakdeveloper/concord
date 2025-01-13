import { conversationParticipants } from '../../database/schema';
import db from '../../database/db';
import { conversations } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const createConversation = protectedProcedure
  .input(
    z.object({
      participantIds: z.array(z.string()),
      isGroup: z.boolean(),
      name: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { user } = ctx;
    const { participantIds, isGroup, name } = input;
    // Ensure current user is included in participants
    const allParticipants = [...new Set([...participantIds, user?.id])];

    // For DMs, ensure only 2 participants
    if (!isGroup && allParticipants.length !== 2) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Direct messages must have exactly 2 participants',
      });
    }

    return await db.transaction(async (tx) => {
      // Check if DM conversation already exists between these users
      if (!isGroup) {
        const existingConversation = await tx.query.conversations.findFirst({
          where: (conversations, { eq, and }) =>
            and(
              eq(conversations.isGroup, false)
              // Complex query to find conversation where both users are participants
            ),
          with: {
            participants: true,
          },
        });

        if (existingConversation) {
          return existingConversation;
        }
      }

      // Create new conversation
      const [conversation] = await tx
        .insert(conversations)
        .values({
          isGroup,
          name: isGroup ? name : null,
        })
        .returning();

      // Add participants
      await tx.insert(conversationParticipants).values(
        allParticipants.map((userId) => ({
          conversationId: conversation.id,
          userId: userId ?? '',
        }))
      );

      return conversation;
    });
  });
