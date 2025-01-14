import { eq } from 'drizzle-orm';
import db from '../../../database/db';
import { channels } from '../../../database/schema';
import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

export const updateChannel = protectedProcedure
  .input(z.object({ channelId: z.string(), name: z.string() }))
  .mutation(async ({ input }) => {
    const { channelId, name } = input;

    const [updatedChannel] = await db
      .update(channels)
      .set({ name })
      .where(eq(channels.id, channelId))
      .returning();

    return updatedChannel;
  });
