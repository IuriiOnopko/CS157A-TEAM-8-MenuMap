import React from "react";

// Small Customer / Business switch shown at the top of both login pages.
// Each side is a link to its own page: /login and /business/login.
export default function LoginTypeSwitch({ active }: { active: "customer" | "business" }) {
  const base = process.env.PUBLIC_URL;
  const tab = (key: "customer" | "business", label: string, href: string) => {
    const on = active === key;
    return (
      <a
        href={href}
        aria-current={on ? "page" : undefined}
        className={`flex-1 text-center rounded-[8px] py-1.5 text-[13px] font-semibold transition-colors ${
          on ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
        }`}
      >
        {label}
      </a>
    );
  };

  return (
    <div className="mb-7 flex gap-1 p-1 rounded-[10px] bg-[#EFEADF] w-full max-w-[260px]">
      {tab("customer", "Customer", `${base}/login`)}
      {tab("business", "Business", `${base}/business/login`)}
    </div>
  );
}
