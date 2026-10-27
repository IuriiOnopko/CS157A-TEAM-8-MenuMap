import React from "react";
import { Link } from "react-router-dom";
import { useSession } from "../session/SessionContext";

// Section links point at the home page, so they also work from the other pages
const HOME = `${process.env.PUBLIC_URL}/`;

export default function Header() {
  const { user, signOut } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-4 flex items-center gap-6 md:gap-10">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-8 h-8 rounded-[9px] bg-sage flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8Z"
                stroke="#FBF6EC"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="2.6" fill="#FBF6EC" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            MenuMap
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 flex-grow">
          <Link
            to="/restaurants"
            className="text-[15px] font-medium text-muted hover:text-ink transition-colors"
          >
            Restaurants
          </Link>
          <Link
            to="/orders"
            className="text-[15px] font-medium text-muted hover:text-ink transition-colors"
          >
            My orders
          </Link>
          <a
            href={`${HOME}#how-it-works`}
            className="text-[15px] font-medium text-muted hover:text-ink transition-colors"
          >
            How it works
          </a>
          <a
            href={`${HOME}#for-businesses`}
            className="text-[15px] font-medium text-muted hover:text-ink transition-colors"
          >
            For businesses
          </a>
          <a
            href={`${HOME}#about`}
            className="text-[15px] font-medium text-muted hover:text-ink transition-colors"
          >
            About
          </a>
        </nav>

        <div className="flex items-center gap-3 ml-auto md:ml-0">
          {user ? (
            <>
              <span className="text-sm font-medium text-muted">{user.name}</span>
              <button
                type="button"
                onClick={signOut}
                className="px-4 py-2 rounded-[9px] text-sm font-semibold border-[1.5px] border-border-strong text-ink hover:border-sage hover:text-sage transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <a
                href={`${process.env.PUBLIC_URL}/login`}
                className="px-4 py-2 rounded-[9px] text-sm font-semibold border-[1.5px] border-border-strong text-ink hover:border-sage hover:text-sage transition-colors"
              >
                Log in
              </a>
              <a
                href={`${process.env.PUBLIC_URL}/signup`}
                className="px-4 py-2 rounded-[9px] text-sm font-semibold bg-sage text-[#FBF6EC] hover:bg-sage-dark transition-colors"
              >
                Sign up
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
