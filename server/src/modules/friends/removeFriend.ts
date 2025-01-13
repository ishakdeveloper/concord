import { and, or } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { friendships } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const removeFriend = protectedProcedure
  .input(
    z.object({
      friendId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const { friendId } = input;
    const { userId } = ctx;

    return await db.transaction(async (tx) => {
      // Check if the friendship exists and user is part of it (with "accepted" status)
      const friendship = await tx
        .select()
        .from(friendships)
        .where(
          and(
            eq(friendships.id, friendId),
            or(
              eq(friendships.requesterId, userId),
              eq(friendships.addresseeId, userId)
            ),
            eq(friendships.status, 'accepted')
          )
        )
        .limit(1);

      if (!friendship.length) {
        throw new Error(
          "Friendship not found or you don't have permission to remove it."
        );
      }

      // Delete the friendship from the database
      const deleted = await tx
        .delete(friendships)
        .where(eq(friendships.id, friendId))
        .returning();

      return {
        id: deleted[0].id,
        requesterId: deleted[0].requesterId,
        addresseeId: deleted[0].addresseeId,
        status: deleted[0].status,
        createdAt: deleted[0].createdAt,
      };
    });
  });
