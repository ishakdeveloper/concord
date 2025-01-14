import { categories } from '../../../database/schema';
import { and } from 'drizzle-orm';

import { isNull } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import db from '../../../database/db';
import { channels } from '../../../database/schema';
import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

export const getGuildChannels = protectedProcedure
  .input(
    z.object({
      guildId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { guildId } = input;
    // Get channels without a category but belonging to this guild
    const uncategorizedChannels = await db.query.channels.findMany({
      where: and(isNull(channels.categoryId), eq(channels.guildId, guildId)),
    });

    // Get categories with their channels for this guild
    const categorizedChannels = await db.query.categories.findMany({
      where: eq(categories.guildId, guildId),
      with: {
        channels: {
          where: eq(channels.guildId, guildId),
        },
      },
    });

    return {
      categorized: categorizedChannels,
      uncategorized: uncategorizedChannels,
    };
  });
