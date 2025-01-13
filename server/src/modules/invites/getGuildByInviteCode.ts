import { guilds } from '../../database/schema';
import { z } from 'zod';
import { protectedProcedure } from '../../trpc';
import { guildInviteLinks } from '../../database/schema';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
export const getGuildByInviteCode = protectedProcedure
  .input(z.object({ inviteCode: z.string() }))
  .query(async ({ input }) => {
    const { inviteCode } = input;

    const guild = await db
      .select()
      .from(guildInviteLinks)
      .innerJoin(guilds, eq(guildInviteLinks.guildId, guilds.id))
      .where(eq(guildInviteLinks.inviteCode, inviteCode))
      .limit(1)
      .then((results) => results[0]);

    return {
      guildInviteLinks: {
        id: guild.guild_invite_links.id,
        inviteCode: guild.guild_invite_links.inviteCode,
        guildId: guild.guild_invite_links.guildId,
        inviterId: guild.guild_invite_links.inviterId,
        maxUses: guild.guild_invite_links.maxUses,
        uses: guild.guild_invite_links.uses,
        expiresAt: guild.guild_invite_links.expiresAt,
        status: guild.guild_invite_links.status,
        createdAt: guild.guild_invite_links.createdAt,
        updatedAt: guild.guild_invite_links.updatedAt,
      },
      guilds: {
        id: guild.guilds.id,
        name: guild.guilds.name,
        iconUrl: guild.guilds.iconUrl,
        ownerId: guild.guilds.ownerId,
        createdAt: guild.guilds.createdAt,
        updatedAt: guild.guilds.updatedAt,
      },
    };
  });
