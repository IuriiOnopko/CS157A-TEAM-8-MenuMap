import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { endSession, getSession, SessionUser } from "../api/session";
import { clearCurrentUser } from "../utils/currentUser";

type SessionState = {
  /** null for a guest */
  user: SessionUser | null;
  /** true until the first check with the server finishes */
  loading: boolean;
  /** Re-reads the session, e.g. right after signing in. */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

/** Shares the signed-in user (from GET /api/session) with every page. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser(await getSession());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Ends the server session and also forgets the login pages' stored copy of the user
  // (utils/currentUser.ts), so every page agrees the user is signed out.
  const signOut = useCallback(async () => {
    clearCurrentUser();
    await endSession();
    setUser(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SessionContext.Provider value={{ user, loading, refresh, signOut }}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside <SessionProvider>");
  return session;
}
