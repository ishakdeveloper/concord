import { sql } from 'drizzle-orm';
import { and, eq } from 'drizzle-orm';
import { conversationParticipants, conversations } from '../../database/schema';
import { friendships } from '../../database/schema';
import db from '../../database/db';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const acceptFriendRequest = protectedProcedure
  .input(
    z.object({
      friendId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { friendId } = input;
    const { userId } = ctx;

    return await db.transaction(async (tx) => {
      // Check if the request exists
      const existingRequest = await tx
        .select({
          id: friendships.id,
          requesterId: friendships.requesterId,
          addresseeId: friendships.addresseeId,
          status: friendships.status,
        })
        .from(friendships)
        .where(eq(friendships.id, friendId));

      if (!existingRequest.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Friend request not found.',
        });
      }

      const { requesterId, addresseeId, status } = existingRequest[0];
      const loggedInUserId = userId;

      // Ensure the logged-in user is the addressee
      if (loggedInUserId !== addresseeId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized to accept this request.',
        });
      }

      // Check if request is pending
      if (status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This friend request has already been processed.',
        });
      }

      // Accept the friend request
      const updatedRequest = await tx
        .update(friendships)
        .set({
          status: 'accepted',
        })
        .where(eq(friendships.id, friendId))
        .returning();

      // First, check for an existing conversation with exactly these two participants
      const existingConversation = await tx
        .select({
          id: conversations.id,
        })
        .from(conversations)
        .where(
          and(
            eq(conversations.isGroup, false),
            sql`(
              SELECT COUNT(DISTINCT cp."userId")
              FROM ${conversationParticipants} cp
              WHERE cp."conversationId" = ${conversations.id}
            ) = 2`,
            sql`EXISTS (
              SELECT 1
              FROM ${conversationParticipants} cp
              WHERE cp."conversationId" = ${conversations.id}
              AND cp."userId" = ${requesterId}
            )`,
            sql`EXISTS (
              SELECT 1
              FROM ${conversationParticipants} cp
              WHERE cp."conversationId" = ${conversations.id}
              AND cp."userId" = ${addresseeId}
            )`
          )
        )
        .limit(1);

      let conversation;

      if (existingConversation.length === 0) {
        // Create a new conversation
        const [newConversation] = await tx
          .insert(conversations)
          .values({
            isGroup: false,
          })
          .returning();

        // Add exactly two participants
        await tx.insert(conversationParticipants).values([
          {
            conversationId: newConversation.id,
            userId: requesterId,
          },
          {
            conversationId: newConversation.id,
            userId: addresseeId,
          },
        ]);

        conversation = newConversation;
      } else {
        conversation = existingConversation[0];
      }

      return {
        message: 'Friendship accepted.',
        friendship: updatedRequest[0],
        conversation,
      };
    });
  });
