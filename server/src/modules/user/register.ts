import { TRPCError } from '@trpc/server';
import argon2d from 'argon2';
import { z } from 'zod';
import { __prod__ } from '../../constants/prod';
import db from '../../database/db';
import { DbUser, users } from '../../database/schema';
import { publicProcedure } from '../../trpc';
import { sendAuthCookies } from '../../utils/createAuthTokens';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { generateDiscriminator } from '../../utils/discriminator';
import { eq, and } from 'drizzle-orm';
import { createAuthTokens } from '../../utils/createAuthTokens';
import { generateNormalizedUsername } from '../../utils/generateUserName';

// Input validation
export const registerInput = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3).max(32),
  dateOfBirth: z.date(),
}).pick({
  email: true,
  password: true,
  name: true,
  dateOfBirth: true,
});

// Output validation
export const registerOutput = createSelectSchema(users).omit({
  password: true,
  refreshTokenVersion: true,
});

export const register = publicProcedure
  .input(registerInput)
  .output(registerOutput)
  .mutation(async ({ input, ctx }) => {
    let newUser: DbUser;

    try {
      // Generate normalized username and keep display name
      const { normalizedName, displayName } = generateNormalizedUsername(
        input.name
      );

      // Generate a discriminator for the normalized name
      const discriminator = await generateDiscriminator(normalizedName);

      // Verify the discriminator is unique for this username
      const existingUser = await db.query.users.findFirst({
        where: and(
          eq(users.name, normalizedName),
          eq(users.discriminator, discriminator)
        ),
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username with this discriminator already exists',
        });
      }

      newUser = (
        await db
          .insert(users)
          .values({
            email: input.email.toLowerCase(),
            password: await argon2d.hash(input.password),
            name: normalizedName,
            displayName: displayName,
            discriminator,
            dateOfBirth: input.dateOfBirth,
            status: 'offline',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
      )[0];

      if (__prod__) {
        return newUser;
      } else {
        const tokens = await createAuthTokens(newUser, ctx.req);
        if (ctx.req.headers['x-app-platform'] !== 'mobile') {
          sendAuthCookies(ctx.res, tokens);
        }
        return newUser;
      }
    } catch (e: any) {
      if (e.message.includes('users_email_unique')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Email already in use',
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: e.message,
      });
    }
  });
