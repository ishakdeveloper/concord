import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { guildMembers, roles } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const getGuildMembersAndRoles = protectedProcedure
  .input(z.object({ guildId: z.string() }))
  .query(async ({ input }) => {
    const { guildId } = input;

    const members = await db
      .select({
        userId: guildMembers.userId,
        roleIds: guildMembers.roleIds,
      })
      .from(guildMembers)
      .where(eq(guildMembers.guildId, guildId));

    const guildRoles = await db
      .select({
        id: roles.id,
        permissions: roles.permissions,
      })
      .from(roles)
      .where(eq(roles.guildId, guildId));

    return {
      members,
      roles: guildRoles,
    };
  });
