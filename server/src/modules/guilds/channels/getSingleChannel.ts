import { z } from 'zod';
import { protectedProcedure } from '../../../trpc';
import { and } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import db from '../../../database/db';
import { channels } from '../../../database/schema';

export const getSingleChannel = protectedProcedure
  .input(z.object({ channelId: z.string(), guildId: z.string() }))
  .query(async ({ input }) => {
    const { channelId, guildId } = input;

    const [channel] = await db
      .select()
      .from(channels)
      .where(and(eq(channels.id, channelId), eq(channels.guildId, guildId)))
      .limit(1);

    if (!channel) {
      throw new Error('Channel not found');
    }

    return channel;
  });
