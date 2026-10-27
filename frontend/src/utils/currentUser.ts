/**
 * Remembers who is logged in, for DISPLAY ONLY (e.g. showing their email).
 * The server keeps the real user_id in its session; never trust this value
 * for anything the backend decides.
 *
 * "Keep me logged in" uses localStorage (survives closing the browser);
 * otherwise sessionStorage (cleared when the tab closes).
 */
const KEY = "menumap.user";

export type AccountType = "CUSTOMER" | "BUSINESS_OWNER";
export type CurrentUser = { email: string; role?: AccountType };

export function saveCurrentUser(user: CurrentUser, remember: boolean) {
  try {
    clearCurrentUser();
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(user));
  } catch {
    // storage blocked (private mode etc.); the page still works without it
  }
}

export function getCurrentUser(): CurrentUser | null {
  try {
    const raw = sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

export function clearCurrentUser() {
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
