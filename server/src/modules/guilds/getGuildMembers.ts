import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { guildMembers } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { users as UserTable } from '../../database/schema';

export const getGuildMembers = protectedProcedure
  .input(z.object({ guildId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { guildId } = input;

    const members = await db
      .select({
        users: {
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          avatarUrl: UserTable.image,
          createdAt: UserTable.createdAt,
          updatedAt: UserTable.updatedAt,
        },
      })
      .from(UserTable)
      .innerJoin(guildMembers, eq(guildMembers.userId, userId))
      .where(eq(guildMembers.guildId, guildId));

    return {
      members,
    };
  });
