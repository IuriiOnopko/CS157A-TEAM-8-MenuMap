import React from "react";

// Shared two-column shell for the Login and Sign Up pages.
// Left: brand panel (hidden on small screens). Right: the form.
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-cream font-body text-ink">
      {/* Brand panel */}
      <aside className="hidden lg:flex lg:w-[44%] relative overflow-hidden bg-sage-dark text-[#FBF6EC] flex-col justify-between p-12">
        {/* soft decorative rings */}
        <div className="pointer-events-none absolute -right-32 -top-32 w-[420px] h-[420px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-16 -top-16 w-[300px] h-[300px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-24 bottom-10 w-[260px] h-[260px] rounded-full bg-sage/40 blur-3xl" />

        <Logo light />

        <div className="relative max-w-md">
          <p className="font-display text-[34px] leading-[1.15] font-semibold tracking-tight">
            Find the dish, not just the restaurant.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[#FBF6EC]/75">
            Search menus by ingredients and dietary needs, order from your
            table with a QR code, or grab it on the way.
          </p>

          <ul className="mt-8 flex flex-col gap-3 text-[14.5px]">
            {[
              "Live menus from local restaurants",
              "Dine-in ordering, no waiting for a server",
              "Pickup orders ahead of time",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-[#FBF6EC]/15 flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FBF6EC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* spacer keeps the headline vertically centered */}
        <div />
      </aside>

      {/* Form side */}
      <main className="flex-1 flex flex-col">
        <div className="px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <a
            href={`${process.env.PUBLIC_URL}/`}
            className="ml-auto text-sm font-medium text-muted hover:text-ink transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[420px]">
            <h1 className="font-display text-[32px] font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-2 text-[15px] text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 text-center text-sm text-muted">{footer}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href={`${process.env.PUBLIC_URL}/`} className="relative flex items-center gap-2.5 w-fit">
      <span className={`w-8 h-8 rounded-[9px] flex items-center justify-center ${light ? "bg-[#FBF6EC]" : "bg-sage"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z"
            stroke={light ? "#244A32" : "#FBF6EC"}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2.6" fill={light ? "#244A32" : "#FBF6EC"} />
        </svg>
      </span>
      <span className={`font-display text-xl font-semibold tracking-tight ${light ? "text-[#FBF6EC]" : "text-ink"}`}>
        MenuMap
      </span>
    </a>
  );
}
