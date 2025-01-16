import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { eq } from 'drizzle-orm';
import db from '../../database/db';
import { users } from '../../database/schema';
import { sign } from 'jsonwebtoken';
import { emailService } from '../../services/email';

export const forgotPassword = publicProcedure
  .input(z.object({ email: z.string().email() }))
  .mutation(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No account found with this email',
      });
    }

    const token = sign(
      { userId: user.id, type: 'reset-password' },
      process.env.EMAIL_SECRET!,
      { expiresIn: '1h' }
    );

    await emailService.sendPasswordResetEmail(
      user.email,
      user.name ?? '',
      token
    );

    return { success: true };
  });
