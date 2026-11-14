import type { AuthUser } from "./currentUser";

export type StaffRole = "EDITOR" | "ADMIN";

/**
 * ADMIN y EDITOR pueden publicar, editar y eliminar guías.
 * USER solo puede consultar el contenido público.
 */
export function canManageGuides(
  user: AuthUser | null
): boolean {
  return (
    user?.role === "ADMIN" ||
    user?.role === "EDITOR"
  );
}

/**
 * El panel de sincronización y sus endpoints están
 * reservados exclusivamente al rol ADMIN.
 */
export function isAdmin(
  user: AuthUser | null
): boolean {
  return user?.role === "ADMIN";
}
