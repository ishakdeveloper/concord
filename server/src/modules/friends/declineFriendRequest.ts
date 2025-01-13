import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { friendships } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const declineFriendRequest = protectedProcedure
  .input(
    z.object({
      friendId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { friendId } = input;

    return await db.transaction(async (tx) => {
      // Check if the request exists
      const existingRequest = await tx
        .select()
        .from(friendships)
        .where(eq(friendships.id, friendId));

      if (!existingRequest.length) {
        throw new Error('Friend request not found.');
      }

      // Delete the declined friend request
      const deletedRequest = await tx
        .delete(friendships)
        .where(eq(friendships.id, friendId))
        .returning();

      return {
        id: deletedRequest[0].id,
        requesterId: deletedRequest[0].requesterId,
        addresseeId: deletedRequest[0].addresseeId,
        status: deletedRequest[0].status,
        createdAt: deletedRequest[0].createdAt,
      };
    });
  });
