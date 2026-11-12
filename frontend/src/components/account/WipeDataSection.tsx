import React, { useState } from "react";
import { deleteAccount } from "../../api/account";
import { errorMessage } from "../../api/http";
import FormField from "../auth/FormField";
import Section, { dangerButton, secondaryButton } from "./Section";

/** Closes the account after asking for the password. onWiped runs once the server has signed the user out. */
export default function WipeDataSection({ onWiped }: { onWiped: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function wipe(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setError("Enter your password to confirm.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await deleteAccount(password);
      onWiped();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  function cancel() {
    setOpen(false);
    setPassword("");
    setError("");
  }

  return (
    <Section
      danger
      title="Delete my account"
      description="Your account is closed right away and marked for deletion. You'll be signed out and won't be able to log in again."
    >
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className={dangerButton}>
          Delete my account
        </button>
      ) : (
        <form onSubmit={wipe} noValidate className="flex flex-col gap-4 max-w-sm">
          <FormField
            label="Confirm with your password"
            name="wipe-password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            error={error}
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={busy} className={dangerButton}>
              {busy ? "Deleting…" : "Delete account"}
            </button>
            <button type="button" onClick={cancel} className={secondaryButton}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </Section>
  );
}
