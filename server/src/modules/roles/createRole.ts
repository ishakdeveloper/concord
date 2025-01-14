import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import { roles } from '../../database/schema';
import { TRPCError } from '@trpc/server';
import { GUILD_PERMISSIONS } from '@concord/common';
import { hasPermission } from '../../utils/permissions';
import { and, eq } from 'drizzle-orm';

export const createRole = protectedProcedure
  .input(
    z.object({
      guildId: z.string(),
      name: z.string().min(1).max(32),
      color: z.number().optional(),
      permissions: z.string(),
      position: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    // Get member's roles directly
    const memberRoles = await db
      .select()
      .from(roles)
      .where(and(eq(roles.guildId, input.guildId)));

    // Calculate permissions from roles
    const permissions = memberRoles.reduce((acc, role) => {
      return acc | BigInt(role.permissions);
    }, BigInt(0));

    const hasManageRoles = hasPermission(
      permissions,
      GUILD_PERMISSIONS.MANAGE_ROLES
    );

    if (!hasManageRoles) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to manage roles',
      });
    }

    const [newRole] = await db
      .insert(roles)
      .values({
        guildId: input.guildId,
        name: input.name,
        color: input.color,
        permissions: input.permissions,
        position: input.position ?? 0,
      })
      .returning();

    return newRole;
  });
