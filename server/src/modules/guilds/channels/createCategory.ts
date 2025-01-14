import db from '../../../database/db';
import { categories } from '../../../database/schema';
import { protectedProcedure } from '../../../trpc';
import { z } from 'zod';

export const createCategory = protectedProcedure
  .input(z.object({ guildId: z.string(), name: z.string() }))
  .mutation(async ({ input }) => {
    const { guildId, name } = input;

    return await db.transaction(async (tx) => {
      const category = await tx
        .insert(categories)
        .values({
          name,
          guildId,
        })
        .returning();

      return category[0];
    });
  });
