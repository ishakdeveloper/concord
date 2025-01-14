import db from '../../../database/db';
import { channels } from '../../../database/schema';
import { protectedProcedure } from '../../../trpc';
import { generateChannelSlug } from '../../../utils/generateChannelSlug';
import { z } from 'zod';

export const createChannelInCategory = protectedProcedure
  .input(
    z.object({ guildId: z.string(), name: z.string(), categoryId: z.string() })
  )
  .mutation(async ({ input }) => {
    const { guildId, name, categoryId } = input;
    const slug = generateChannelSlug(name);

    const [channel] = await db
      .insert(channels)
      .values({
        name,
        categoryId,
        guildId,
        slug,
      })
      .returning();

    return channel;
  });
