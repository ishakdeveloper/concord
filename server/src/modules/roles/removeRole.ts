import { protectedProcedure } from '../../trpc';
import { z } from 'zod';
import db from '../../database/db';
import { roleAssignments, roles } from '../../database/schema';
import { TRPCError } from '@trpc/server';
import { GUILD_PERMISSIONS } from '@concord/common';
import { hasPermission } from '../../utils/permissions';
import { and, eq } from 'drizzle-orm';

export const removeRole = protectedProcedure
  .input(
    z.object({
      guildId: z.string(),
      roleId: z.string(),
      memberId: z.string(),
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

    const [removed] = await db
      .delete(roleAssignments)
      .where(
        and(
          eq(roleAssignments.roleId, input.roleId),
          eq(roleAssignments.memberId, input.memberId)
        )
      )
      .returning();

    return removed;
  });
