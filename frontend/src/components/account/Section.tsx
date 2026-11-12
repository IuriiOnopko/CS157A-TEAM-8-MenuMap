import React from "react";

// Shared pieces of the account settings cards (pages/Account.tsx).

export const primaryButton =
  "h-10 px-5 rounded-[10px] bg-sage text-[#FBF6EC] text-sm font-semibold hover:bg-sage-dark transition disabled:opacity-50 disabled:cursor-not-allowed";

export const secondaryButton =
  "h-9 px-4 rounded-[9px] text-sm font-semibold border-[1.5px] border-border-strong text-ink hover:border-sage hover:text-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const dangerButton =
  "h-10 px-5 rounded-[10px] bg-[#B42318] text-white text-sm font-semibold hover:bg-[#912018] transition disabled:opacity-50 disabled:cursor-wait";

export default function Section({
  title,
  description,
  danger = false,
  children,
}: {
  title: string;
  description?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`bg-card border rounded-2xl p-6 ${danger ? "border-red-200" : "border-border"}`}>
      <h2 className={`m-0 font-display text-xl font-semibold tracking-tight ${danger ? "text-[#B42318]" : ""}`}>
        {title}
      </h2>
      {description && <p className="m-0 mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** The result of the last save: an error, a success note, or nothing. */
export function SaveStatus({ error, success }: { error?: string; success?: string }) {
  if (error)
    return (
      <p role="alert" className="m-0 text-[13px] text-red-700">
        {error}
      </p>
    );
  if (success)
    return (
      <p role="status" className="m-0 text-[13px] font-semibold text-sage">
        {success}
      </p>
    );
  return null;
}
