import { GUILD_PERMISSIONS } from '@concord/common';

export function hasPermission(
  memberPermissions: bigint,
  requiredPermission: bigint
): boolean {
  // Administrator has all permissions
  if (
    (memberPermissions & GUILD_PERMISSIONS.ADMINISTRATOR) ===
    GUILD_PERMISSIONS.ADMINISTRATOR
  ) {
    return true;
  }
  return (memberPermissions & requiredPermission) === requiredPermission;
}

export function calculateMemberPermissions(
  memberRoles: { permissions: string }[]
): bigint {
  return memberRoles.reduce((permissions, role) => {
    return permissions | BigInt(role.permissions);
  }, BigInt(0));
}

export function parsePermissionString(permissionString: string): bigint {
  return BigInt(permissionString);
}

export function stringifyPermissions(permissions: bigint): string {
  return permissions.toString();
}
