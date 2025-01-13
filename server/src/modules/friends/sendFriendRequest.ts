import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import { friendships, users as UserTable } from '../../database/schema';
import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import db from '../../database/db';
import { TRPCError } from '@trpc/server';

export const sendFriendRequest = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      discriminator: z.string().regex(/^\d{4}$/),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { name, discriminator } = input;
    const { user } = ctx;

    return await db.transaction(async (tx) => {
      // Find addressee by name and discriminator
      const addressee = await tx
        .select()
        .from(UserTable)
        .where(
          and(
            eq(UserTable.name, name),
            eq(UserTable.discriminator, discriminator)
          )
        );

      if (!addressee.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User not found.',
        });
      }

      const addresseeId = addressee[0].id;

      // Prevent sending friend request to self
      if (addresseeId === user?.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot send a friend request to yourself.',
        });
      }

      // Validation: Check if a request already exists or if they're already friends
      const existingFriendship = await tx
        .select()
        .from(friendships)
        .where(
          sql`${eq(friendships.requesterId, user?.id ?? '')} AND ${eq(
            friendships.addresseeId,
            addresseeId
          )} OR 
              ${eq(friendships.requesterId, addresseeId)} AND ${eq(
                friendships.addresseeId,
                user?.id ?? ''
              )}`
        );

      if (existingFriendship.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Friend request already exists or you are already friends.',
        });
      }

      const friendRequest = await tx
        .insert(friendships)
        .values({
          requesterId: user?.id ?? '',
          addresseeId,
          status: 'pending',
        })
        .returning();

      return friendRequest[0];
    });
  });
