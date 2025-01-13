import db from '../database/db';
import { users } from '../database/schema';
import { and, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export async function generateDiscriminator(name: string): Promise<string> {
  // Get all existing discriminators for this name
  const existingDiscriminators = await db
    .select({ discriminator: users.discriminator })
    .from(users)
    .where(eq(users.name, name));

  const usedSet = new Set(existingDiscriminators.map((d) => d.discriminator));

  // Try sequential generation first (0001-9999)
  for (let i = 1; i < 10000; i++) {
    const discriminator = i.toString().padStart(4, '0');
    if (!usedSet.has(discriminator)) {
      return discriminator;
    }
  }

  throw new TRPCError({
    code: 'BAD_REQUEST',
    message:
      'This username has no available discriminators. Please try a different name.',
  });
}

export function validateDiscriminator(discriminator: string): boolean {
  return /^\d{4}$/.test(discriminator);
}

export async function isNameDiscriminatorAvailable(
  name: string,
  discriminator: string
): Promise<boolean> {
  const existingUser = await db.query.users.findFirst({
    where: and(eq(users.name, name), eq(users.discriminator, discriminator)),
  });

  return !existingUser;
}
