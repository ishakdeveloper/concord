import { protectedProcedure } from '../../trpc';
import db from '../../database/db';
import { notifications } from '../../database/schema';
import { eq } from 'drizzle-orm';

export const deleteAllNotifications = protectedProcedure.mutation(
  async ({ ctx }) => {
    await db
      .delete(notifications)
      .where(eq(notifications.userId, ctx.user!.id));

    return { success: true };
  }
);
