import { eq } from 'drizzle-orm';
import db from '../../../database/db';
import { channels } from '../../../database/schema';
import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

export const deleteChannel = protectedProcedure
  .input(z.object({ channelId: z.string() }))
  .mutation(async ({ input }) => {
    const { channelId } = input;

    const [deletedChannel] = await db
      .delete(channels)
      .where(eq(channels.id, channelId))
      .returning();

    return deletedChannel;
  });
