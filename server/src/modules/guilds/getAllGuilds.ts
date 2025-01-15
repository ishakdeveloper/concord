import { and } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { channels } from '../../database/schema';
import { guildMembers } from '../../database/schema';
import { guilds } from '../../database/schema';
import { protectedProcedure } from '../../trpc';

export const getAllGuilds = protectedProcedure.query(async ({ ctx }) => {
  const { userId } = ctx;

  const userGuilds = await db
    .select({
      guilds: {
        id: guilds.id,
        name: guilds.name,
        iconUrl: guilds.iconUrl,
        ownerId: guilds.ownerId,
        createdAt: guilds.createdAt,
        updatedAt: guilds.updatedAt,
        defaultChannelId: channels.id,
      },
      guildMembers: guildMembers,
    })
    .from(guilds)
    .leftJoin(guildMembers, eq(guildMembers.guildId, guilds.id))
    .leftJoin(
      channels,
      and(eq(channels.guildId, guilds.id), eq(channels.name, 'General'))
    )
    .where(eq(guildMembers.userId, userId));

  return userGuilds;
});