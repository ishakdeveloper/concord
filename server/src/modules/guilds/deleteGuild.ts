import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { guilds } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const deleteGuild = protectedProcedure
  .input(z.object({ guildId: z.string() }))
  .mutation(async ({ input }) => {
    const { guildId } = input;

    return await db.transaction(async (tx) => {
      await tx.delete(guilds).where(eq(guilds.id, guildId));
      return [{ message: 'Guild deleted successfully' }];
    });
  });
