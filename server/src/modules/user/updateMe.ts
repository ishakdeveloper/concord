import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { users } from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import db from '../../database/db';
import { uploadFile } from '../../utils/uploadFile';
import { eq } from 'drizzle-orm';

// Create input schema based on users table, excluding read-only fields
const updateMeInput = createInsertSchema(users, {
  email: z.string().email().optional(),
  displayName: z.string().min(3).max(32).optional(),
  name: z.string().min(3).max(32).optional(),
  image: z.string().url().optional().nullable(),
  banner: z.string().url().optional().nullable(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional()
    .nullable(),
  bio: z.string().max(190).optional().nullable(),
  pronouns: z.string().max(50).optional().nullable(),
  status: z.enum(['online', 'idle', 'dnd', 'invisible', 'offline']).optional(),
  customStatus: z.string().max(128).optional().nullable(),
  currentActivity: z.string().max(128).optional().nullable(),
  enableDM: z.boolean().optional(),
})
  .partial()
  .extend({
    imageFile: z.instanceof(File).optional(),
    bannerFile: z.instanceof(File).optional(),
  });

// Output validation
const updateMeOutput = createSelectSchema(users).omit({
  password: true,
  refreshTokenVersion: true,
});

export const updateMe = protectedProcedure
  .input(updateMeInput)
  .output(updateMeOutput)
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.user?.id;
    let imageUrl = input.image;
    let bannerUrl = input.banner;

    try {
      if (input.imageFile) {
        imageUrl = await uploadFile(input.imageFile, 'avatars');
      }

      if (input.bannerFile) {
        bannerUrl = await uploadFile(input.bannerFile, 'banners');
      }

      const { ...updateData } = input;

      const [updatedUser] = await db
        .update(users)
        .set({
          ...updateData,
          image: imageUrl,
          banner: bannerUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId!))
        .returning();

      if (!updatedUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return updatedUser;
    } catch (error: any) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }
  });
