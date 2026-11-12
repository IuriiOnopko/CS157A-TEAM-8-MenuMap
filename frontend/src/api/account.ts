/**
 * The signed-in customer's own settings (UserSettings at /api/account) and saved allergens
 * (AllergenServlet at /api/allergens/mine). Changes are sent as form fields; a guest gets 401.
 */
import { apiFetch } from "./http";

export type Profile = { name: string; email: string; phone: string | null };

export type Allergen = { id: number; name: string; description: string | null };

export function getProfile(): Promise<Profile> {
  return apiFetch<Profile>("/account");
}

/** Send only the fields that changed (name, email, phone). 409 if another account already uses the email. */
export function updateProfile(changes: Record<string, string>): Promise<void> {
  return apiFetch<void>("/account/profile", { method: "POST", body: new URLSearchParams(changes) });
}

/** 403 if currentPassword is wrong. */
export function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  return apiFetch<void>("/account/password", {
    method: "POST",
    body: new URLSearchParams({ currentPassword, newPassword }),
  });
}

/** Closes the account and marks it for deletion, then signs out. 403 if the password is wrong. */
export function deleteAccount(password: string): Promise<void> {
  return apiFetch<void>("/account/delete", { method: "POST", body: new URLSearchParams({ password }) });
}

/** Every allergen there is. */
export function getAllergens(): Promise<Allergen[]> {
  return apiFetch<Allergen[]>("/allergens");
}

/** The allergens the signed-in customer avoids (customer_allergen). */
export function getMyAllergens(): Promise<Allergen[]> {
  return apiFetch<Allergen[]>("/allergens/mine");
}

/** Replaces the customer's whole allergen list. */
export function saveMyAllergens(allergenIds: number[]): Promise<void> {
  return apiFetch<void>("/allergens/mine", {
    method: "POST",
    body: new URLSearchParams(allergenIds.map((id) => ["allergenId", String(id)])),
  });
}
