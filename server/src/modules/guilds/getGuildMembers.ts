import { eq, and } from 'drizzle-orm';
import db from '../../database/db';
import { guildMembers } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { users as UserTable } from '../../database/schema';

export const getGuildMembers = protectedProcedure
  .input(z.object({ guildId: z.string() }))
  .query(async ({ input }) => {
    const { guildId } = input;

    const members = await db
      .select({
        users: UserTable,
      })
      .from(UserTable)
      .innerJoin(
        guildMembers,
        and(
          eq(guildMembers.userId, UserTable.id),
          eq(guildMembers.guildId, guildId)
        )
      );

    return {
      members,
    };
  });
