import db from '../../../database/db';
import { channels } from '../../../database/schema';
import { protectedProcedure } from '../../../trpc';
import { generateChannelSlug } from '../../../utils/generateChannelSlug';
import { z } from 'zod';

export const createChannel = protectedProcedure
  .input(
    z.object({
      guildId: z.string(),
      name: z.string(),
      categoryId: z.string().optional(),
      position: z.number().optional(),
      isPrivate: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { guildId, name, categoryId, position, isPrivate } = input;

    const slug = generateChannelSlug(name);

    return await db.transaction(async (tx) => {
      const [newChannel] = await tx
        .insert(channels)
        .values({
          name,
          guildId,
          categoryId: categoryId || null,
          position,
          isPrivate,
          slug,
        })
        .returning();

      return newChannel;
    });
  });
