export type Role = "ADMIN" | "TECHNICIAN" | "USER";

export function hasRole(userRole: string | undefined | null, ...allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as Role);
}

export function isAdmin(userRole: string | undefined | null): boolean {
  return userRole === "ADMIN";
}

export function isTechnicianOrAdmin(userRole: string | undefined | null): boolean {
  return userRole === "ADMIN" || userRole === "TECHNICIAN";
}
