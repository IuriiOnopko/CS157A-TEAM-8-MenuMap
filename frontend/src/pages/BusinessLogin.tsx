import React, { useState } from "react";
import AuthLayout from "../components/auth/AuthLayout";
import FormField from "../components/auth/FormField";
import LoginTypeSwitch from "../components/auth/LoginTypeSwitch";
import { loginBusinessOwner } from "../api/business";
import { saveCurrentUser } from "../utils/currentUser";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Login for restaurant owners. There is no sign-up: owner accounts are
// added to the database by the MenuMap team.
export default function BusinessLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await loginBusinessOwner({ email: email.trim(), pass: password });
      saveCurrentUser({ email: email.trim(), role: "BUSINESS_OWNER" }, false);
      window.location.href = `${process.env.PUBLIC_URL}/business/dashboard`;
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Business login"
      subtitle="For restaurant owners managing menus and orders."
      footer={<>Need a business account? Contact the MenuMap team to get set up.</>}
    >
      <LoginTypeSwitch active="business" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField
          label="Business email"
          name="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="owner@restaurant.com"
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
        />

        {serverError && (
          <p role="alert" className="text-[13px] text-center text-red-700 bg-red-50 border border-red-200 rounded-[10px] px-3 py-2.5">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-[10px] bg-ink text-[#FBF6EC] text-[15px] font-semibold hover:bg-black active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-wait"
        >
          {submitting ? "Logging in..." : "Log in to dashboard"}
        </button>
      </form>
    </AuthLayout>
  );
}
