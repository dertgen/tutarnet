import type { AdminRole } from "@/types/admin";

type Permission = {
  resource: string;
  action: string;
  granted: boolean;
};

type StaffWithPermissions = {
  role: AdminRole;
  permissions: Pick<Permission, "resource" | "action" | "granted">[];
};

const WILDCARD = "*";

export const ROLE_PERMISSIONS: Record<AdminRole, Record<string, string[]>> = {
  SUPER_ADMIN: { [WILDCARD]: [WILDCARD] },
  ADMIN: {
    partners: ["read", "write", "delete", "approve", "export"],
    users: ["read", "write", "delete"],
    categories: ["read", "write", "delete"],
    reports: ["read", "write", "delete", "resolve"],
    settings: ["read", "write"],
    banners: ["read", "write", "delete"],
    pages: ["read", "write", "delete"],
    packages: ["read", "write", "delete"],
    staff: ["read"],
    audit: ["read"],
    analytics: ["read"],
  },
  MODERATOR: {
    reports: ["read", "write", "resolve"],
    partners: ["read"],
    users: ["read"],
    analytics: ["read"],
  },
  EDITOR: {
    pages: ["read", "write"],
    banners: ["read", "write"],
    categories: ["read"],
  },
  VIEWER: {
    partners: ["read"],
    users: ["read"],
    categories: ["read"],
    reports: ["read"],
    audit: ["read"],
    analytics: ["read"],
  },
};

export function can(staff: StaffWithPermissions, resource: string, action: string): boolean {
  const override = staff.permissions.find(
    (p) => p.resource === resource && p.action === action
  );
  if (override !== undefined) return override.granted;

  const rolePerms = ROLE_PERMISSIONS[staff.role];
  if (!rolePerms) return false;

  if (rolePerms[WILDCARD]?.includes(WILDCARD)) return true;

  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return false;

  return resourcePerms.includes(WILDCARD) || resourcePerms.includes(action);
}
