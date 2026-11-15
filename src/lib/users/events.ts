export const USER_UPDATED_EVENT =
  "card-meta:user-updated";

/**
 * Avisa a los componentes cliente (por ejemplo el menú del
 * Navbar) de que el perfil del usuario cambió.
 */
export function notifyUserUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new Event(USER_UPDATED_EVENT)
  );
}
