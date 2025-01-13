import { and } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { channels, guildMembers, messages } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const leaveGuild = protectedProcedure
  .input(z.object({ guildId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { userId, user } = ctx;
    const { guildId } = input;

    return await db.transaction(async (tx) => {
      const result = await tx
        .delete(guildMembers)
        .where(
          and(
            eq(guildMembers.guildId, guildId),
            eq(guildMembers.userId, userId)
          )
        );

      // Get the general channel ID
      const generalChannel = await tx
        .select()
        .from(channels)
        .where(and(eq(channels.guildId, guildId), eq(channels.name, 'General')))
        .limit(1);

      // Create a system message for user leaving
      await tx.insert(messages).values({
        channelId: generalChannel[0].id,
        authorId: userId,
        content: `${user?.name} left the server`,
        isSystem: true,
      });

      console.log('Rows deleted:', result.rowCount);

      if (result.rowCount === 0) {
        return [
          {
            error: 'You are not a member of this guild or already left.',
          },
        ];
      }

      return [{ message: 'Left guild successfully' }];
    });
  });
