import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { guilds } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const updateGuild = protectedProcedure
  .input(z.object({ guildId: z.string(), name: z.string() }))
  .mutation(async ({ input }) => {
    const { guildId, name } = input;

    return await db.transaction(async (tx) => {
      const updatedGuild = await tx
        .update(guilds)
        .set({ name })
        .where(eq(guilds.id, guildId))
        .returning();
      return [updatedGuild[0]];
    });
  });
