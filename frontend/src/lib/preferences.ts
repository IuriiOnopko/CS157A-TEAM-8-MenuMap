/**
 * A customer's saved diets, by name.
 *
 * The database has no table for these, so they're kept in this browser's
 * localStorage, one entry per user id: they don't follow the user to another device.
 * (Allergens are saved to the account instead, in customer_allergen.)
 */
export type Preferences = { diets: string[] };

export const NO_PREFERENCES: Preferences = { diets: [] };

const key = (userId: number) => `menumap.preferences.${userId}`;

export function loadPreferences(userId: number): Preferences {
  try {
    const stored = JSON.parse(localStorage.getItem(key(userId)) ?? "null");
    return { diets: Array.isArray(stored?.diets) ? stored.diets : [] };
  } catch {
    return NO_PREFERENCES; // storage blocked or unreadable
  }
}

export function savePreferences(userId: number, preferences: Preferences) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(preferences));
  } catch {
    // storage blocked (private mode etc.); the choice just isn't remembered
  }
}

export function clearPreferences(userId: number) {
  try {
    localStorage.removeItem(key(userId));
  } catch {
    // ignore
  }
}
