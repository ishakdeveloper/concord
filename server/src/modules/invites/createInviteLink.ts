import { guildInviteLinks, guildMembers } from '../../database/schema';
import db from '../../database/db';
import { protectedProcedure } from '../../trpc';
import { generateInviteCode } from '../../utils/generateInviteCode';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const createInviteLink = protectedProcedure
  .input(z.object({ guildId: z.string(), maxUses: z.number().optional() }))
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { guildId, maxUses } = input;
    return await db.transaction(async (tx) => {
      // Check if user is already a member of this guild
      const existingMember = await tx
        .select()
        .from(guildMembers)
        .where(
          and(
            eq(guildMembers.guildId, guildId),
            eq(guildMembers.userId, user?.id ?? '')
          )
        )
        .limit(1)
        .then((results) => results[0]);

      if (!existingMember) {
        throw new Error(
          'You must be a member of this guild to create an invite'
        );
      }

      // Check if invite code already exists for this guild
      const existingInvite = await tx
        .select()
        .from(guildInviteLinks)
        .where(
          and(
            eq(guildInviteLinks.guildId, guildId),
            eq(guildInviteLinks.status, 'active')
          )
        )
        .limit(1)
        .then((results) => results[0]);

      if (existingInvite) {
        return {
          200: {
            id: existingInvite.id,
            inviteCode: existingInvite.inviteCode,
            guildId: existingInvite.guildId,
            inviterId: existingInvite.inviterId,
            maxUses: existingInvite.maxUses,
            uses: existingInvite.uses,
            expiresAt: existingInvite.expiresAt,
            status: existingInvite.status,
            createdAt: existingInvite.createdAt,
            updatedAt: existingInvite.createdAt,
          },
        };
      }

      const inviteCode = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Set expiration to 7 days from now

      const [invite] = await tx
        .insert(guildInviteLinks)
        .values({
          inviteCode,
          guildId,
          inviterId: user?.id ?? '',
          maxUses,
          expiresAt,
        })
        .returning();

      return {
        id: invite.id,
        inviteCode: invite.inviteCode,
        guildId: invite.guildId,
        inviterId: invite.inviterId,
        maxUses: invite.maxUses,
        uses: invite.uses,
        expiresAt: invite.expiresAt,
        status: invite.status,
        createdAt: invite.createdAt,
        updatedAt: invite.createdAt,
      };
    });
  });
