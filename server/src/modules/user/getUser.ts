import db from '../../database/db';
import { protectedProcedure } from '../../trpc';
import { eq } from 'drizzle-orm';
import { users } from '../../database/schema';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const getUser = protectedProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { userId } = input;
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    return user;
  });
