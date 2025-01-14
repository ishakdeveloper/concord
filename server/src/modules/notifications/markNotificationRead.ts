import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import { notifications } from '../../database/schema';
import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const markNotificationRead = protectedProcedure
  .input(z.object({ notificationId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, input.notificationId),
          eq(notifications.userId, ctx.user!.id)
        )
      )
      .returning();

    if (!updated) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Notification not found',
      });
    }

    return updated;
  });
