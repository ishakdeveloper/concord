import { and, eq, isNull } from 'drizzle-orm';
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
      newCategoryId: z.string().nullable().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { channelId, newPosition, newCategoryId, guildId } = input;

    // First, get all channels in the same category or uncategorized
    const existingChannels = await db
      .select()
      .from(channels)
      .where(
        and(
          eq(channels.guildId, guildId),
          newCategoryId
            ? eq(channels.categoryId, newCategoryId)
            : isNull(channels.categoryId)
        )
      )
      .orderBy(channels.position);

    // Update positions of other channels
    await Promise.all(
      existingChannels.map((channel, index) => {
        const position = index >= newPosition ? index + 1 : index;
        return db
          .update(channels)
          .set({ position })
          .where(eq(channels.id, channel.id));
      })
    );

    // Update the target channel with new position and category
    const [updatedChannel] = await db
      .update(channels)
      .set({
        position: newPosition,
        categoryId: newCategoryId,
      })
      .where(eq(channels.id, channelId))
      .returning();

    return updatedChannel;
  });
