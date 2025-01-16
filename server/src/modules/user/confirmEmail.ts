import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { users } from '../../database/schema';
import { sign, verify } from 'jsonwebtoken';
import { emailService } from '../../services/email';

export const sendConfirmationEmail = publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const token = sign(
      { userId: user.id, type: 'confirm-email' },
      process.env.EMAIL_SECRET!,
      { expiresIn: '1d' }
    );

    await emailService.sendConfirmationEmail(
      user.email,
      user.name ?? '',
      token
    );

    return { success: true };
  });

export const confirmEmail = publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input }) => {
    try {
      const decoded = verify(input.token, process.env.EMAIL_SECRET!) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'confirm-email') {
        throw new Error('Invalid token type');
      }

      await db
        .update(users)
        .set({ confirmed: true, updatedAt: new Date() })
        .where(eq(users.id, decoded.userId));

      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid or expired token',
      });
    }
  });
