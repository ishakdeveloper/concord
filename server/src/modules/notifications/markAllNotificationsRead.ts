import { protectedProcedure } from '../../trpc';
import db from '../../database/db';
import { notifications } from '../../database/schema';
import { eq } from 'drizzle-orm';

export const markAllNotificationsRead = protectedProcedure.mutation(
  async ({ ctx }) => {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, ctx.user!.id));

    return { success: true };
  }
);
