import db from '../../database/db';
import {
  categories,
  guildInviteLinks,
  guildMembers,
  guilds,
} from '../../database/schema';
import { channels } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { generateChannelSlug } from '../../utils/generateChannelSlug';
import { generateInviteCode } from '../../utils/generateInviteCode';
import { z } from 'zod';

export const createGuild = protectedProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { name } = input;

    return await db.transaction(async (tx) => {
      // Create the guild
      const [guild] = await tx
        .insert(guilds)
        .values({
          name,
          ownerId: user?.id ?? '',
        })
        .returning();

      const guildId = guild.id;

      // Add owner to the guild as a member
      await tx.insert(guildMembers).values({
        guildId,
        userId: user?.id ?? '',
      });

      // Create a default invite link for the guild
      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now

      await tx.insert(guildInviteLinks).values({
        inviteCode,
        guildId,
        inviterId: user?.id ?? '',
        maxUses: null, // Unlimited by default
        expiresAt,
      });

      // Create the default category
      const category = await tx
        .insert(categories)
        .values({
          name: 'Text channels', // Default category name
          guildId,
        })
        .returning();

      const categoryId = category[0].id;

      const defaultChannelName = 'General';
      const slug = generateChannelSlug(defaultChannelName);

      // Create the default "General" channel within the category
      const [channel] = await tx
        .insert(channels)
        .values({
          guildId,
          name: defaultChannelName, // Default channel name
          categoryId,
          slug,
        })
        .returning();

      return {
        guild,
        defaultCategory: category,
        defaultChannel: {
          ...channel,
          categoryId: channel.categoryId!,
        },
        defaultInviteCode: inviteCode,
      };
    });
  });
