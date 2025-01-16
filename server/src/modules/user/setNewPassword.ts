import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { users } from '../../database/schema';
import { verify } from 'jsonwebtoken';
import argon2d from 'argon2';
import { incrementTokenVersion } from '../../utils/createAuthTokens';

export const setNewPassword = publicProcedure
  .input(
    z.object({
      token: z.string(),
      password: z.string().min(8),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const decoded = verify(input.token, process.env.EMAIL_SECRET!) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'reset-password') {
        throw new Error('Invalid token type');
      }

      const hashedPassword = await argon2d.hash(input.password);

      // Increment token version to invalidate all existing sessions
      await incrementTokenVersion(decoded.userId);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, decoded.userId));

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid or expired token',
      });
    }
  });
