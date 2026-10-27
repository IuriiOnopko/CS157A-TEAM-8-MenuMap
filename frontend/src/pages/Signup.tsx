import React, { useState } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import FormField from "../components/auth/FormField";
import { registerCustomer } from "../api/customers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Fields map to the user_account table in MenuMapDB.sql.
// They're sent to CustomerServlet as: name, email, phoneNum, pass.
type Fields = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
};
type Errors = Partial<Record<keyof Fields, string>>;

function passwordStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
  return { score, label: pw ? labels[score] : "" };
}

export default function Signup() {
  const [f, setF] = useState<Fields>({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [created, setCreated] = useState(false);

  const set = (key: keyof Fields) => (v: string) => setF((prev) => ({ ...prev, [key]: v }));
  const strength = passwordStrength(f.password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const next: Errors = {};
    if (!f.name.trim()) next.name = "Enter your name.";
    if (!EMAIL_RE.test(f.email.trim())) next.email = "Enter a valid email address.";
    if (f.phone && !/^[\d\s()+-]{7,30}$/.test(f.phone)) next.phone = "Enter a valid phone number.";
    if (f.password.length < 8) next.password = "Use at least 8 characters.";
    if (f.confirm !== f.password) next.confirm = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await registerCustomer({
        name: f.name.trim(),
        email: f.email.trim(),
        phoneNum: f.phone.trim(),
        pass: f.password,
      });
      setCreated(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <AuthLayout
        title="Congrats, your account is ready!"
        subtitle="Now log in to start ordering from your table or ahead for pickup."
        footer={null}
      >
        <div className="flex flex-col items-center text-center gap-6 bg-card border border-border rounded-2xl px-6 py-9">
          <span className="w-16 h-16 rounded-full bg-[#EFF3EA] flex items-center justify-center">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#2F6F4E" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <p className="text-[15px] text-muted">
            We created an account for <span className="font-semibold text-ink">{f.email.trim()}</span>.
          </p>
          <a
            href={`${process.env.PUBLIC_URL}/login`}
            className="w-full h-11 rounded-[10px] bg-sage text-[#FBF6EC] text-[15px] font-semibold hover:bg-sage-dark transition flex items-center justify-center"
          >
            Go to login
          </a>
        </div>
      </AuthLayout>
    );
  }

  const barColors = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-sage", "bg-sage"];

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Order from your table or ahead for pickup."
      footer={
        <>
          Already have an account?{" "}
          <a href={`${process.env.PUBLIC_URL}/login`} className="font-semibold text-sage hover:text-sage-dark">
            Log in
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          label="Full name"
          name="name"
          value={f.name}
          onChange={set("name")}
          placeholder="Jane Doe"
          autoComplete="name"
          error={errors.name}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={f.email}
          onChange={set("email")}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <FormField
          label="Phone number"
          name="phone"
          type="tel"
          value={f.phone}
          onChange={set("phone")}
          placeholder="(408) 555-0123"
          autoComplete="tel"
          optional
          hint="Used to text you when a pickup order is ready."
          error={errors.phone}
        />

        <div className="flex flex-col gap-2">
          <FormField
            label="Password"
            name="password"
            type="password"
            value={f.password}
            onChange={set("password")}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password}
          />
          {f.password && (
            <div className="flex items-center gap-3">
              <div className="flex-1 grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-colors ${i < strength.score ? barColors[strength.score] : "bg-border"}`}
                  />
                ))}
              </div>
              <span className="text-[12px] font-medium text-muted-2 w-16 text-right">{strength.label}</span>
            </div>
          )}
        </div>

        <FormField
          label="Confirm password"
          name="confirm"
          type="password"
          value={f.confirm}
          onChange={set("confirm")}
          placeholder="Type it again"
          autoComplete="new-password"
          error={errors.confirm}
        />

        {serverError && (
          <p role="alert" className="text-[13px] text-center text-red-700 bg-red-50 border border-red-200 rounded-[10px] px-3 py-2.5">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-[10px] bg-sage text-[#FBF6EC] text-[15px] font-semibold hover:bg-sage-dark active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-wait"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="mt-7 pt-6 border-t border-border text-center text-[13.5px] text-muted">
        Own a restaurant?{" "}
        <a href={`${process.env.PUBLIC_URL}/business/apply`} className="font-semibold text-ink hover:text-sage">
          List it on MenuMap
        </a>
      </div>
    </AuthLayout>
  );
}
