import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { sendSystemMessageHandler } from '../messages/sendSystemMessageHandler';
import { inArray } from 'drizzle-orm';
import { conversationParticipants } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { users as UserTable } from '../../database/schema';
import db from '../../database/db';

export const addMembers = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
      memberIds: z.array(z.string()),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { conversationId, memberIds } = input;

    return await db.transaction(async (tx) => {
      // Get conversation and verify it exists and is a group
      const conversation = await tx.query.conversations.findFirst({
        where: (conversations, { eq }) => eq(conversations.id, conversationId),
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      if (!conversation.isGroup) {
        throw new Error('Can only add members to group conversations');
      }

      // Get existing participants
      const existingParticipants = await tx
        .select()
        .from(conversationParticipants)
        .where(eq(conversationParticipants.conversationId, conversationId));

      // Filter out members who are already participants
      const newMemberIds = memberIds.filter(
        (memberId) => !existingParticipants.some((p) => p.userId === memberId)
      );

      if (newMemberIds.length === 0) {
        throw new Error('All specified users are already participants');
      }

      // Add new participants
      await tx.insert(conversationParticipants).values(
        newMemberIds.map((memberId) => ({
          conversationId: conversationId,
          userId: memberId,
        }))
      );

      // Get member names for system message
      const newMembers = await tx
        .select()
        .from(UserTable)
        .where(inArray(UserTable.id, newMemberIds));

      const memberNames = newMembers.map((m) => m.name).join(', ');

      // Add system message
      await sendSystemMessageHandler(
        conversationId,
        `${memberNames} joined the group`,
        ctx.user?.id ?? ''
      );

      return { message: 'Members added successfully' };
    });
  });
