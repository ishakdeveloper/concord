import { and, eq } from 'drizzle-orm';
import db from '../../database/db';
import {
  guildInviteLinks,
  guildMembers,
  messages,
  channels,
  inviteLinkUsages,
} from '../../database/schema';
import { protectedProcedure } from '../../trpc';
import { z } from 'zod';

export const useInviteLink = protectedProcedure
  .input(z.object({ inviteCode: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { inviteCode } = input;

    return await db.transaction(async (tx) => {
      const invite = await tx
        .select()
        .from(guildInviteLinks)
        .where(eq(guildInviteLinks.inviteCode, inviteCode))
        .limit(1)
        .then((results) => results[0]);

      if (!invite || invite.status !== 'active') {
        throw new Error('Invalid invite code');
      }

      if (new Date() > (invite.expiresAt ?? new Date())) {
        throw new Error('Invite has expired');
      }

      if (invite.maxUses && invite.uses && invite.uses >= invite.maxUses) {
        throw new Error('Invite link has reached its maximum uses');
      }

      // Check if user is already a member
      const existingMember = await tx
        .select()
        .from(guildMembers)
        .where(
          and(
            eq(guildMembers.guildId, invite.guildId),
            eq(guildMembers.userId, user?.id ?? '')
          )
        )
        .limit(1)
        .then((results) => results[0]);

      if (existingMember) {
        throw new Error('You are already a member of this server');
      }

      // Add the user to the guild
      await tx.insert(guildMembers).values({
        guildId: invite.guildId,
        userId: user?.id ?? '',
      });

      // Create a system message for user joining
      await tx.insert(messages).values({
        channelId: await tx
          .select()
          .from(channels)
          .where(
            and(
              eq(channels.guildId, invite.guildId),
              eq(channels.name, 'General')
            )
          )
          .limit(1)
          .then((results) => results[0].id),
        authorId: user?.id ?? '',
        content: `${user?.name} joined the server`,
        isSystem: true,
      });

      // Track invite usage
      await tx.insert(inviteLinkUsages).values({
        inviteLinkId: invite.id,
        invitedUserId: user?.id ?? '',
      });

      // Increment usage count
      await tx
        .update(guildInviteLinks)
        .set({
          uses: (invite.uses ?? 0) + 1,
        })
        .where(eq(guildInviteLinks.id, invite.id));

      return { message: 'Invite used successfully' };
    });
  });
