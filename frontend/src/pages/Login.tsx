import React, { useState } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import FormField from "../components/auth/FormField";
import LoginTypeSwitch from "../components/auth/LoginTypeSwitch";
import { loginCustomer } from "../api/customers";
import { saveCurrentUser } from "../utils/currentUser";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await loginCustomer({ email: email.trim(), pass: password });
      saveCurrentUser({ email: email.trim(), role: "CUSTOMER" }, remember);
      window.location.href = `${process.env.PUBLIC_URL}/account`;
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to see your orders and saved restaurants."
      footer={
        <>
          Don't have an account?{" "}
          <a href={`${process.env.PUBLIC_URL}/signup`} className="font-semibold text-sage hover:text-sage-dark">
            Sign up
          </a>
        </>
      }
    >
      <LoginTypeSwitch active="customer" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password}
          rightLabel={
            <a href="#forgot" className="text-[12.5px] font-semibold text-sage hover:text-sage-dark">
              Forgot password?
            </a>
          }
        />

        <label className="flex items-center gap-2.5 text-sm text-muted cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-border-strong accent-sage"
          />
          Keep me logged in
        </label>

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
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
