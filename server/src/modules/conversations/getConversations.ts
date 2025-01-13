import { eq } from 'drizzle-orm';
import { conversations } from '../../database/schema';
import db from '../../database/db';
import { conversationParticipants } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { users as UserTable } from '../../database/schema';

export const getConversations = protectedProcedure.query(async ({ ctx }) => {
  const { user } = ctx;

  return await db
    .select()
    .from(conversations)
    .innerJoin(
      conversationParticipants,
      eq(conversations.id, conversationParticipants.conversationId)
    )
    .where(eq(conversationParticipants.userId, user?.id ?? ''))
    .then(async (conversations) => {
      // Fetch participants with user data
      return Promise.all(
        conversations.map(async (conv) => {
          const participants = await db
            .select({
              id: conversationParticipants.id,
              conversationId: conversationParticipants.conversationId,
              userId: conversationParticipants.userId,
              joinedAt: conversationParticipants.joinedAt,
              user: {
                id: UserTable.id,
                name: UserTable.name,
                email: UserTable.email,
                image: UserTable.image,
              },
            })
            .from(conversationParticipants)
            .innerJoin(
              UserTable,
              eq(conversationParticipants.userId, UserTable.id)
            )
            .where(
              eq(conversationParticipants.conversationId, conv.conversations.id)
            );

          return {
            ...conv.conversations,
            participants,
          };
        })
      );
    });
});
