import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { users } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';

export const me = protectedProcedure.query(async ({ ctx }) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, ctx.userId),
  });

  if (!user) throw new TRPCError({ code: 'NOT_FOUND' });
  return { user };
});
