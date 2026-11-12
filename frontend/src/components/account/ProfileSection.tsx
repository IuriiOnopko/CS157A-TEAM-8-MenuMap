import React, { useEffect, useState } from "react";
import { getProfile, Profile, updateProfile } from "../../api/account";
import { errorMessage } from "../../api/http";
import FormField from "../auth/FormField";
import Section, { primaryButton, SaveStatus } from "./Section";

// same rules as the sign-up form
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+-]{7,30}$/;

type Fields = { name: string; email: string; phone: string };

const toFields = (p: Profile): Fields => ({ name: p.name, email: p.email, phone: p.phone ?? "" });

/** Name, email and phone number. onSaved lets the page refresh the signed-in user shown in its header. */
export default function ProfileSection({ onSaved }: { onSaved: () => void }) {
  const [saved, setSaved] = useState<Fields | null>(null);
  const [f, setF] = useState<Fields>({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [status, setStatus] = useState<{ error?: string; success?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setSaved(toFields(p));
        setF(toFields(p));
      })
      .catch((e) => setStatus({ error: errorMessage(e) }));
  }, []);

  const set = (key: keyof Fields) => (value: string) => {
    setF((prev) => ({ ...prev, [key]: value }));
    setStatus({});
  };
  const changed = saved !== null && (f.name !== saved.name || f.email !== saved.email || f.phone !== saved.phone);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Fields> = {};
    if (!f.name.trim()) next.name = "Enter your name.";
    if (!EMAIL_RE.test(f.email.trim())) next.email = "Enter a valid email address.";
    if (f.phone.trim() && !PHONE_RE.test(f.phone.trim())) next.phone = "Enter a valid phone number.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // only what changed is sent; the server leaves the other fields as they are
    const now: Fields = { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() };
    const changes: Record<string, string> = {};
    (Object.keys(now) as (keyof Fields)[]).forEach((key) => {
      if (saved && now[key] !== saved[key]) changes[key] = now[key];
    });

    setSaving(true);
    try {
      await updateProfile(changes);
      setSaved(now);
      setF(now);
      setStatus({ success: "Saved." });
      onSaved();
    } catch (err) {
      setStatus({ error: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Personal information" description="Restaurants see your name on pickup orders.">
      {saved === null ? (
        status.error ? (
          <SaveStatus error={status.error} />
        ) : (
          <p className="m-0 text-sm text-muted-2">Loading…</p>
        )
      ) : (
        <form onSubmit={save} noValidate className="flex flex-col gap-4">
          <FormField label="Name" name="name" value={f.name} onChange={set("name")} autoComplete="name" error={errors.name} />
          <FormField
            label="Email"
            name="email"
            type="email"
            value={f.email}
            onChange={set("email")}
            autoComplete="email"
            error={errors.email}
          />
          <FormField
            label="Phone"
            name="phone"
            type="tel"
            value={f.phone}
            onChange={set("phone")}
            autoComplete="tel"
            optional
            error={errors.phone}
          />
          <div className="flex items-center gap-4">
            <button type="submit" disabled={!changed || saving} className={primaryButton}>
              {saving ? "Saving…" : "Save changes"}
            </button>
            <SaveStatus {...status} />
          </div>
        </form>
      )}
    </Section>
  );
}
