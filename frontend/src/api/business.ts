/**
 * POST /menumap/api/business/login  (business owner login servlet, to be written)
 *
 * Sent as form fields: email, pass
 * Expected reply: 2xx {"ok": true} on success, 401 {"error": "..."} for a wrong
 * email/password or a non-owner account, 403 {"error": "..."} for a suspended
 * account, or 500 {"error": "..."} if something broke.
 */
export type BusinessLoginInput = {
  email: string;
  pass: string;
};

/** Throws an Error with a user-facing message if the login failed. */
export async function loginBusinessOwner(input: BusinessLoginInput): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${process.env.PUBLIC_URL}/api/business/login`, {
      method: "POST",
      body: new URLSearchParams(input),
    });
  } catch {
    throw new Error("Can't reach the server. Make sure Tomcat is running.");
  }

  if (!res.ok) {
    let message =
      res.status === 401
        ? "Incorrect email or password."
        : res.status === 404
        ? "Business login isn't available on the server yet."
        : "Could not log you in. Please try again.";
    try {
      const body: { error?: string } = await res.json();
      if (body.error) message = body.error;
    } catch {
      // reply wasn't JSON; keep the default message
    }
    throw new Error(message);
  }
}
