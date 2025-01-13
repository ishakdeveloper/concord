import { guilds } from '../../database/schema';
import db from '../../database/db';
import { guildInviteLinks } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { eq } from 'drizzle-orm';
import { users as UserTable } from '../../database/schema';
import { z } from 'zod';

export const getGuildInviteLinks = protectedProcedure
  .input(z.object({ guildId: z.string() }))
  .query(async ({ input }) => {
    const { guildId } = input;

    const invites = await db
      .select({
        inviteCode: guildInviteLinks.inviteCode,
        uses: guildInviteLinks.uses,
        maxUses: guildInviteLinks.maxUses,
        expiresAt: guildInviteLinks.expiresAt,
        status: guildInviteLinks.status,
        inviter: {
          id: UserTable.id,
          username: UserTable.name,
        },
        guild: {
          id: guilds.id,
          name: guilds.name,
        },
      })
      .from(guildInviteLinks)
      .innerJoin(guilds, eq(guilds.id, guildInviteLinks.guildId))
      .innerJoin(UserTable, eq(UserTable.id, guildInviteLinks.inviterId))
      .where(eq(guildInviteLinks.guildId, guildId));

    return invites;
  });
