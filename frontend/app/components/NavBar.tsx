import { useState } from "react";
import { Link, NavLink } from "react-router";
import { ConnectButton } from "@mysten/dapp-kit";
import { useAuth } from "../providers/AuthProvider";

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  [
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
    isActive
      ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800",
  ].join(" ");

export default function NavBar() {
  const { token, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-md dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-600 text-white">S</span>
          <span className="hidden text-xl tracking-tight sm:inline">Streak</span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/leaderboard" className={navLinkClasses}>
            Leaderboard
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={navLinkClasses}>
            Profile
          </NavLink>
          {!token ? (
            <NavLink to="/login" className={navLinkClasses}>
              Login
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          )}
          <ConnectButton className="myst-btn" />
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          {token && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
              {user?.walletAddress ? shortAddress(user.walletAddress) : "Signed in"}
            </span>
          )}
          <button
            type="button"
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden">
          <div className="container mx-auto space-y-2 px-4 pb-4">
            <NavLink to="/leaderboard" className={navLinkClasses} onClick={() => setMenuOpen(false)}>
              Leaderboard
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClasses} onClick={() => setMenuOpen(false)}>
              Dashboard
            </NavLink>
            <NavLink to="/profile" className={navLinkClasses} onClick={() => setMenuOpen(false)}>
              Profile
            </NavLink>
            {!token ? (
              <NavLink to="/login" className={navLinkClasses} onClick={() => setMenuOpen(false)}>
                Login
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Logout
              </button>
            )}
            <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
              <ConnectButton className="myst-btn w-full" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
