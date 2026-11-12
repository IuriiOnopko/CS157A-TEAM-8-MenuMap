import React, { useState } from "react";
import { changePassword } from "../../api/account";
import { errorMessage } from "../../api/http";
import FormField from "../auth/FormField";
import Section, { primaryButton, SaveStatus } from "./Section";

type Errors = { current?: string; next?: string; confirm?: string };

/** Changes the password after checking the current one. */
export default function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({});
    const found: Errors = {};
    if (!current) found.current = "Enter your current password.";
    if (next.length < 8) found.next = "Use at least 8 characters.";
    else if (next === current) found.next = "Pick a password different from your current one.";
    if (confirm !== next) found.confirm = "Passwords don't match.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      setStatus({ success: "Password changed." });
    } catch (err) {
      setStatus({ error: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Password" description="Use at least 8 characters.">
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <FormField
          label="Current password"
          name="current-password"
          type="password"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
          error={errors.current}
        />
        <FormField
          label="New password"
          name="new-password"
          type="password"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          error={errors.next}
        />
        <FormField
          label="Confirm new password"
          name="confirm-password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          error={errors.confirm}
        />
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className={primaryButton}>
            {saving ? "Changing…" : "Change password"}
          </button>
          <SaveStatus {...status} />
        </div>
      </form>
    </Section>
  );
}
