import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import { eq } from 'drizzle-orm';
import { roles } from '../../database/schema';

export const getUserRoles = protectedProcedure
  .input(
    z.object({
      guildId: z.string(),
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const userRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.guildId, input.guildId));

    return userRoles;
  });
