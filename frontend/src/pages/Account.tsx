import React from "react";
import { clearCurrentUser, getCurrentUser } from "../utils/currentUser";

// Simple landing page after a customer logs in.
// The cards are placeholders for features coming in later sprints.

const BASE = process.env.PUBLIC_URL;

const actions = [
  {
    title: "Browse restaurants",
    body: "Find dishes by ingredients, nutrition, and dietary needs.",
    href: `${BASE}/restaurants`,
    icon: (
      <path d="M11 4a7 7 0 1 0 4.4 12.4L20 21M11 4a7 7 0 0 1 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    ),
  },
  {
    title: "Order from your table",
    body: "Scan the QR code at your table to see the live menu.",
    href: undefined,
    icon: (
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    ),
  },
  {
    title: "My orders",
    body: "See your current orders and past purchases.",
    href: undefined,
    icon: (
      <path d="M7 3h10l1 4H6l1-4ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Zm4 5h4M10 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
];

export default function Account() {
  // Only customers belong here; a logged-in business owner sees the logged-out view.
  const stored = getCurrentUser();
  const user = stored && stored.role !== "BUSINESS_OWNER" ? stored : null;

  function logOut() {
    clearCurrentUser();
    window.location.href = `${BASE}/login`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream font-body text-ink">
      {/* Top bar */}
      <header className="bg-cream/95 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-4 flex items-center gap-4">
          <a href={`${BASE}/`} className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-[9px] bg-sage flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z" stroke="#FBF6EC" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.6" fill="#FBF6EC" />
              </svg>
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">MenuMap</span>
          </a>

          {user && (
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-muted truncate max-w-[220px]">{user.email}</span>
              <button
                onClick={logOut}
                className="px-4 py-2 rounded-[9px] text-sm font-semibold border-[1.5px] border-border-strong text-ink hover:border-sage hover:text-sage transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 md:px-10 py-12">
        {user ? (
          <>
            <div className="flex items-center gap-4">
              <span className="w-14 h-14 rounded-full bg-sage text-[#FBF6EC] font-display text-2xl font-semibold flex items-center justify-center shrink-0">
                {user.email.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-3xl md:text-[34px] font-semibold tracking-tight">
                  You're logged in
                </h1>
                <p className="mt-1 text-[15px] text-muted truncate">
                  Signed in as <span className="font-semibold text-ink">{user.email}</span>
                </p>
              </div>
            </div>

            <h2 className="mt-12 text-[12.5px] font-bold tracking-wide uppercase text-muted-2">
              What would you like to do?
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {actions.map((a) => {
                const inner = (
                  <>
                    <span className="w-10 h-10 rounded-[10px] bg-[#EFF3EA] text-sage flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{a.icon}</svg>
                    </span>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="font-semibold text-[16px]">{a.title}</span>
                      {!a.href && (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-clay bg-[#FBEFE2] rounded-full px-2 py-0.5">
                          Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-muted leading-relaxed">{a.body}</p>
                  </>
                );
                const base = "block bg-card border border-border rounded-2xl p-5 transition";
                return a.href ? (
                  <a key={a.title} href={a.href} className={`${base} hover:border-sage hover:shadow-sm`}>
                    {inner}
                  </a>
                ) : (
                  <div key={a.title} className={`${base} opacity-80`}>
                    {inner}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="max-w-md mx-auto text-center mt-10 bg-card border border-border rounded-2xl px-6 py-10">
            <h1 className="font-display text-[28px] font-semibold tracking-tight">You're not logged in</h1>
            <p className="mt-2 text-[15px] text-muted">Log in to see your account.</p>
            <a
              href={`${BASE}/login`}
              className="mt-6 inline-flex h-11 px-6 items-center justify-center rounded-[10px] bg-sage text-[#FBF6EC] text-[15px] font-semibold hover:bg-sage-dark transition"
            >
              Go to login
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
