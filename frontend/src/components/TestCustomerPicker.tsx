import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { errorMessage } from "../api/http";
import { getTestCustomers, SessionUser, signInAsTestCustomer } from "../api/session";
import { useSession } from "../session/SessionContext";

type Props = {
  /** Why sign-in is needed, e.g. "Sign in to order for pickup." */
  reason: string;
  onClose: () => void;
  onSignedIn: () => void;
};

/**
 * TEMPORARY: "sign in" as a test customer with no password, so pickup and
 * order history can be tried before the team's real login exists. Delete
 * this file and backend TestCustomerServlet.java once it does, and send
 * people to the login page instead.
 */
export default function TestCustomerPicker({ reason, onClose, onSignedIn }: Props) {
  const { refresh } = useSession();
  const [customers, setCustomers] = useState<SessionUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    getTestCustomers()
      .then(setCustomers)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const choose = async (customer: SessionUser) => {
    setBusyId(customer.id);
    setError(null);
    try {
      await signInAsTestCustomer(customer.id);
      await refresh();
      onSignedIn();
    } catch (e) {
      setError(errorMessage(e));
      setBusyId(null);
    }
  };

  // Rendered at the end of <body>: inside the map's side panel (which uses transform and
  // backdrop-filter) a fixed overlay would only cover the panel, not the whole page
  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-ink/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="test-sign-in-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm max-h-[80vh] bg-cream rounded-2xl shadow-2xl p-5 flex flex-col gap-3 font-body text-ink"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="test-sign-in-title" className="m-0 font-display text-xl font-semibold">
            Sign in
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 -mr-1 -mt-1 rounded-lg text-xl text-muted hover:bg-[#EFEADF]"
          >
            ×
          </button>
        </div>
        <p className="m-0 text-[14px] text-muted">{reason}</p>
        <p className="m-0 text-[12.5px] leading-snug rounded-lg px-3 py-2 bg-[#FDF3E7] text-clay">
          Temporary test sign-in: pick a test customer. Real login with a password will replace this.
        </p>

        {error && (
          <p role="alert" className="m-0 text-[13px] font-medium text-[#B42318]">
            {error}
          </p>
        )}
        {!customers && !error && <p className="m-0 text-[14px] text-muted-2">Loading test customers…</p>}

        {customers && (
          <ul className="m-0 p-0 list-none flex flex-col gap-1.5 overflow-y-auto">
            {customers.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  onClick={() => choose(customer)}
                  disabled={busyId !== null}
                  className="w-full text-left px-3 py-2.5 rounded-xl border border-border bg-card hover:border-sage transition-colors disabled:opacity-60"
                >
                  <span className="block text-[14.5px] font-semibold">
                    {customer.name}
                    {busyId === customer.id && <span className="font-normal text-muted-2"> · signing in…</span>}
                  </span>
                  <span className="block text-[12.5px] text-muted-2">{customer.email}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body
  );
}
