import { eq, sql } from 'drizzle-orm';
import { conversationParticipants, conversations } from '../../database/schema';
import db from '../../database/db';
import { friendships } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { users as UserTable } from '../../database/schema';

export const getAllFriends = protectedProcedure.query(async ({ ctx }) => {
  const { userId } = ctx;

  const friendshipsData = await db
    .select({
      friendshipId: friendships.id,
      friendId: sql`CASE
             WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId}
             ELSE ${friendships.requesterId}
           END`.as('friendId'),
      conversationId: sql`(
            SELECT cp."conversationId"
            FROM ${conversationParticipants} cp
            WHERE cp."userId" = ${userId}
            AND EXISTS (
              SELECT 1 
              FROM ${conversationParticipants} cp2
              WHERE cp2."conversationId" = cp."conversationId"
              AND cp2."userId" = CASE
                WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId}
                ELSE ${friendships.requesterId}
              END
            )
            AND EXISTS (
              SELECT 1
              FROM ${conversations} c
              WHERE c.id = cp."conversationId"
              AND c."isGroup" = false
            )
            LIMIT 1
          )`.as('conversationId'),
    })
    .from(friendships)
    .where(
      sql`${eq(friendships.status, 'accepted')} AND 
           (${eq(friendships.requesterId, userId)} OR 
            ${eq(friendships.addresseeId, userId)})`
    );

  // If no friendships found, return an empty list
  if (!friendshipsData.length) {
    return [];
  }

  // Extract friend IDs and friendship IDs
  const friendIds = friendshipsData.map((f) => ({
    friendshipId: f.friendshipId,
    friendId: f.friendId,
    conversationId: f.conversationId,
  }));

  // Fetch user details for friends, including friendshipId
  const friends = await db
    .select({
      id: UserTable.id,
      name: UserTable.name,
      email: UserTable.email,
      image: UserTable.image,
    })
    .from(UserTable)
    .where(
      sql`${UserTable.id} IN (${sql.join(
        friendIds.map((item) => sql`${item.friendId}`),
        sql`, `
      )})`
    );

  // Attach the friendshipId and conversationId to each friend
  const friendsWithDetails = friends.map((friend, index) => ({
    ...friend,
    friendshipId: friendIds[index].friendshipId,
    conversationId: friendIds[index].conversationId,
  }));

  return friendsWithDetails.map((friend) => ({
    ...friend,
    conversationId: friend.conversationId as string | null,
  }));
});
