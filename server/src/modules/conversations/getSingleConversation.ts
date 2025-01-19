import { and } from 'drizzle-orm';
import { createCachedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import { conversationParticipants } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { conversations } from '../../database/schema';
import { users as UserTable } from '../../database/schema';
import { TRPCError } from '@trpc/server';

export const getSingleConversation = createCachedProcedure({
  key: 'single-conversation',
})
  .input(
    z.object({
      conversationId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { conversationId } = input;
    const { user } = ctx;

    console.log('getSingleConversation - Starting with:', {
      conversationId,
      userId: user?.id,
      userEmail: user?.email, // to verify we have the right user
    });

    if (!user) {
      console.log('getSingleConversation - No user in context');
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to view conversations',
      });
    }

    try {
      // First verify the conversation exists
      const conversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      console.log('getSingleConversation - Conversation check:', conversation);

      if (!conversation || conversation.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      // Check if user is a participant
      const participant = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, conversationId),
            eq(conversationParticipants.userId, user.id)
          )
        )
        .limit(1);

      console.log('getSingleConversation - Participant check:', {
        found: participant.length > 0,
        participant,
      });

      if (!participant || participant.length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to view this conversation',
        });
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

      console.log('getSingleConversation - Success:', {
        conversationFound: !!conv,
        participantsCount: participants.length,
      });

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
    } catch (error) {
      console.error('Error in getSingleConversation:', {
        error,
        conversationId,
        userId: user.id,
      });
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch conversation',
        cause: error,
      });
    }
  });
