/**
 * Shared fetch wrapper for the Tomcat API at /menumap/api.
 *
 * Errors from the server arrive as {"error": "..."} and are thrown as
 * ApiError with that message, so pages can show it to the user directly.
 */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${process.env.PUBLIC_URL}/api${path}`, {
      ...init,
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ApiError(0, "Couldn't reach the server. Check your connection and try again.");
  }
  if (res.status === 204) {
    return undefined as T;
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? `Server responded with ${res.status}`);
  }
  return body as T;
}

/** The message to show for a failed request. */
export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong.";
}
