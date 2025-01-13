import db from '../../database/db';
import { messages } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const sendMessage = protectedProcedure
  .input(
    z.object({
      conversationId: z.string(),
      content: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { conversationId, content } = input;
    const { user } = ctx;

    return await db.insert(messages).values({
      content,
      authorId: user?.id ?? '',
      conversationId,
    });
  });
