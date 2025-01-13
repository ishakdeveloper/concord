import { eq } from 'drizzle-orm';
import { z } from 'zod';
import db from '../../database/db';
import { users } from '../../database/schema';
import { publicProcedure } from '../../trpc';
import { sendAuthCookies } from '../../utils/createAuthTokens';
import { TRPCError } from '@trpc/server';
import { __prod__ } from '../../constants/prod';
import argon2d from 'argon2';

export const login = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (!user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User not found',
      });
    }

    if (!user.password) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "Click 'Forgot password?' to set a password.",
      });
    }

    try {
      const valid = await argon2d.verify(user.password, input.password);
      if (!valid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid password',
        });
      }
    } catch (err: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: err.message,
      });
    }

    if (__prod__ && !user.confirmed) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Check your email for a confirmation email.',
      });
    }

    sendAuthCookies(ctx.res, user);

    return {
      user: user,
    };
  });
