/**
 * POST /menumap/api/customers/register  (CustomerServlet)
 *
 * Sent as form fields so the servlet can read them with req.getParameter():
 *   name, email, phoneNum, pass
 *
 * Server replies 201 {"ok": true} on success, 400 {"error": "..."} if a required field is missing,
 * 409 {"error": "..."} if the email already has an account, or 500 {"error": "..."} on failure.
 */
export type RegisterInput = {
  name: string;
  email: string;
  phoneNum: string;
  pass: string;
};

/** Throws an Error with a user-facing message if the account wasn't created. */
export async function registerCustomer(input: RegisterInput): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${process.env.PUBLIC_URL}/api/customers/register`, {
      method: "POST",
      body: new URLSearchParams(input),
    });
  } catch {
    throw new Error("Can't reach the server. Make sure Tomcat is running.");
  }

  if (!res.ok) {
    let message = "Could not create your account. Please try again.";
    try {
      const body: { error?: string } = await res.json();
      if (body.error) message = body.error;
    } catch {
      // reply wasn't JSON; keep the default message
    }
    throw new Error(message);
  }
}

/**
 * POST /menumap/api/customers/login  (CustomerLoginServlet)
 *
 * Sent as form fields: email, pass
 * Server replies 2xx {"ok": true} on success, 401 {"error": "..."} for a wrong
 * email/password, or 500 {"error": "..."} if something broke.
 * On success Tomcat also sets a session cookie (JSESSIONID) that the browser
 * sends back automatically on later requests.
 */
export type LoginInput = {
  email: string;
  pass: string;
};

/** Throws an Error with a user-facing message if the login failed. */
export async function loginCustomer(input: LoginInput): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${process.env.PUBLIC_URL}/api/customers/login`, {
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
