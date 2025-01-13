import { desc } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import {
  messages as MessagesTable,
  users as UserTable,
} from '../../database/schema';

export const getConversationMessages = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
      limit: z.number().min(1).max(100).default(50),
    })
  )
  .query(async ({ input }) => {
    const { conversationId, limit } = input;

    const messages = await db
      .select({
        id: MessagesTable.id,
        content: MessagesTable.content,
        conversationId: MessagesTable.conversationId,
        createdAt: MessagesTable.createdAt,
        isSystem: MessagesTable.isSystem,
        authorId: {
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          image: UserTable.image,
        },
      })
      .from(MessagesTable)
      .innerJoin(UserTable, eq(MessagesTable.authorId, UserTable.id))
      .where(eq(MessagesTable.conversationId, conversationId))
      .orderBy(desc(MessagesTable.createdAt))
      .limit(limit);

    return {
      messages: messages
        .filter((m) => m.content !== null && m.conversationId !== null)
        .map((m) => ({
          ...m,
          content: m.content!,
          conversationId: m.conversationId!,
        })),
    };
  });
