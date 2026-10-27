/**
 * Who is signed in (SessionServlet). The backend keeps the signed-in user in
 * the Tomcat session cookie, so these calls need no token.
 */
import { apiFetch } from "./http";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  accountType: "CUSTOMER" | "BUSINESS_OWNER" | "ADMINISTRATOR";
};

export async function getSession(): Promise<SessionUser | null> {
  const body = await apiFetch<{ user: SessionUser | null }>("/session");
  return body.user;
}

export function endSession(): Promise<void> {
  return apiFetch<void>("/session", { method: "DELETE" });
}

// TEMPORARY: password-less test sign-in (TestCustomerServlet). Remove with
// TestCustomerPicker.tsx once the team's real login exists.

export function getTestCustomers(): Promise<SessionUser[]> {
  return apiFetch<SessionUser[]>("/test-customers");
}

export function signInAsTestCustomer(userId: number): Promise<SessionUser> {
  return apiFetch<SessionUser>("/test-customers", { method: "POST", body: JSON.stringify({ userId }) });
}
