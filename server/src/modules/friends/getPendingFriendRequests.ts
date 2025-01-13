import { and, or } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { friendships } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { users as UserTable } from '../../database/schema';

export const getPendingFriendRequests = protectedProcedure.query(
  async ({ ctx }) => {
    const { userId } = ctx;

    // Fetch pending friend requests where user is either the requester or the addressee
    const pendingRequests = await db
      .select({
        id: friendships.id,
        requesterId: friendships.requesterId,
        addresseeId: friendships.addresseeId,
        requesterName: UserTable.name,
        createdAt: friendships.createdAt,
        requester: {
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          image: UserTable.image,
        },
      })
      .from(friendships)
      .innerJoin(UserTable, eq(friendships.requesterId, UserTable.id)) // Join on the requester
      .where(
        and(
          eq(friendships.status, 'pending'),
          or(
            eq(friendships.addresseeId, userId), // Incoming request
            eq(friendships.requesterId, userId) // Outgoing request
          )
        )
      );

    // Format the requests to differentiate between incoming and outgoing
    const formattedRequests = pendingRequests.map((request) => {
      if (request.requesterId === userId) {
        // Outgoing request
        return { ...request, type: 'outgoing' };
      }
      // Incoming request
      return { ...request, type: 'incoming' };
    });

    return formattedRequests.map((request) => ({
      ...request,
      type: request.type as 'incoming' | 'outgoing',
    }));
  }
);
