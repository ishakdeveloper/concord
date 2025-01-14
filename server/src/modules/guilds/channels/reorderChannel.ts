import { eq } from 'drizzle-orm';
import db from '../../../database/db';
import { channels } from '../../../database/schema';
import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

export const reorderChannel = protectedProcedure
  .input(
    z.object({
      guildId: z.string(),
      channelId: z.string(),
      newPosition: z.number(),
      newCategoryId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { channelId, newPosition, newCategoryId } = input;

    const [updatedChannel] = await db
      .update(channels)
      .set({
        position: newPosition,
        categoryId: newCategoryId || null,
      })
      .where(eq(channels.id, channelId))
      .returning();

    return updatedChannel;
  });
