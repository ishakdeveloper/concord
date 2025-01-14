import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import { notifications } from '../../database/schema';
import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const deleteNotification = protectedProcedure
  .input(z.object({ notificationId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const [deleted] = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.user!.id)
        )
      )
      .returning();

    if (!deleted) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Notification not found',
      });
    }

    return deleted;
  });
