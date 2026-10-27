import React from "react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[#F3EFE4]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-11 flex flex-wrap justify-between gap-10">
        <div className="flex flex-col gap-2.5 max-w-[280px]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-[7px] bg-sage" />
            <span className="font-display text-base font-semibold text-ink">
              MenuMap
            </span>
          </div>
          <p className="m-0 text-[13px] text-muted-2 leading-relaxed">
            Real menus. Real prices. Ordered straight from the table.
          </p>
        </div>

        <div className="flex gap-16 flex-wrap">
          <FooterColumn
            title="Diners"
            links={[
              ["Browse restaurants", `${process.env.PUBLIC_URL}/restaurants`],
              ["How ordering works", "#how-it-works"],
            ]}
          />
          <FooterColumn
            title="Businesses"
            links={[
              ["List your restaurant", `${process.env.PUBLIC_URL}/business/apply`],
              ["Owner dashboard", `${process.env.PUBLIC_URL}/business/login`],
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              ["About", "#about"],
              ["Contact", `${process.env.PUBLIC_URL}/contact`],
            ]}
          />
        </div>
      </div>
    </footer>
  );
}

// Links are [label, href]. Most hrefs point at pages coming in later sprints.
function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[12.5px] font-bold tracking-wide uppercase text-muted-2">
        {title}
      </span>
      {links.map(([label, href]) => (
        <a
          key={label}
          href={href}
          className="text-sm font-medium text-muted hover:text-ink transition-colors"
        >
          {label}
        </a>
      ))}
    </div>
  );
}
