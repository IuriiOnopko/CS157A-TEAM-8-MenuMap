/**
 * Sends someone to the login page and back again: pages link to loginPath(),
 * and the login page reads the page to return to with returnPath().
 */

/** Router path of the login page that comes back to `returnTo` (a path in this app) afterwards. */
export function loginPath(returnTo: string): string {
  return `/login?next=${encodeURIComponent(returnTo)}`;
}

/**
 * The page to return to after logging in, from the login page's `next` parameter.
 * Only paths inside this app are accepted, so a crafted link can't send people to another site.
 */
export function returnPath(next: string | null): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  return next;
}
