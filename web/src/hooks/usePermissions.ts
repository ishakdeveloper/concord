import { trpc } from '@/lib/trpc';
import { useGuildStore } from '@/stores/useGuildStore';
import { useUserStore } from '@/stores/useUserStore';
import { GUILD_PERMISSIONS } from '@concord/common';

export function usePermissions(guildId?: string) {
  const currentUser = useUserStore((state) => state.user);
  const currentGuildId = useGuildStore((state) => state.currentGuildId);
  const targetGuildId = guildId || currentGuildId;

  const { data: guildData } = trpc.guild.getGuildMembersAndRoles.useQuery(
    { guildId: targetGuildId ?? '' },
    { enabled: !!targetGuildId }
  );

  const hasPermission = (permission: bigint) => {
    if (!currentUser || !guildData) return false;

    // Get member's roles
    const member = guildData.members.find((m) => m.userId === currentUser.id);
    if (!member) return false;

    const memberRoles = guildData.roles.filter((role) =>
      member.roleIds?.includes(role.id)
    );

    const permissions = memberRoles.reduce(
      (perms, role) => perms | BigInt(role.permissions),
      BigInt(0)
    );

    if (
      (permissions & GUILD_PERMISSIONS.ADMINISTRATOR) ===
      GUILD_PERMISSIONS.ADMINISTRATOR
    ) {
      return true;
    }

    return (permissions & permission) === permission;
  };

  return { hasPermission, GUILD_PERMISSIONS };
}
