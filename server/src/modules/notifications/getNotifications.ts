import { protectedProcedure } from '../../trpc';
import db from '../../database/db';
import { notifications } from '../../database/schema';
import { eq } from 'drizzle-orm';

export const getNotifications = protectedProcedure.query(async ({ ctx }) => {
  const userNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, ctx.user!.id))
    .orderBy(notifications.createdAt);

  return userNotifications.map((notification) => ({
    ...notification,
    data: JSON.parse(notification.data || '{}'),
  }));
});
