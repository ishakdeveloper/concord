import { guilds } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { and } from 'drizzle-orm';
import db from '../../database/db';
import { channels } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const getSingleGuild = protectedProcedure
  .input(z.object({ guildId: z.string() }))
  .query(async ({ input }) => {
    const { guildId } = input;

    const [guild] = await db
      .select()
      .from(guilds)
      .where(eq(guilds.id, guildId));

    const [defaultChannel] = await db
      .select()
      .from(channels)
      .where(and(eq(channels.guildId, guildId), eq(channels.name, 'General')));

    return {
      guild,
      defaultChannel,
    };
  });
