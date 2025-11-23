import { useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../providers/AuthProvider";

export const meta = () => [{ title: "Profile • Streak" }];

export default function Profile() {
  const { user, token, refreshProfile } = useAuth();

  useEffect(() => {
    if (token) {
      refreshProfile().catch(() => {
        /* ignore; dashboard handles errors */
      });
    }
  }, [token, refreshProfile]);

  if (!token) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Profile
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Authenticate with your wallet to unlock streak insights and history.
          </p>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-slate-600 dark:text-slate-300">
            Wallet details appear here after you log in. We never ask for
            private keys—only a one-time nonce signature.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105"
          >
            Connect wallet
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Profile
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Wallet summary, streak history, and hero point totals for your
          account.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Wallet
            </h2>
            <dl className="mt-4 grid gap-4 text-sm">
              <ProfileRow label="Address" value={user?.walletAddress} mono />
              <ProfileRow
                label="Hero points"
                value={user?.heroPoints?.toLocaleString()}
              />
              <ProfileRow
                label="Current streak"
                value={user?.dailyStreak ? `${user.dailyStreak} days` : "—"}
              />
              <ProfileRow
                label="Last check-in"
                value={formatDate(user?.lastCheckIn)}
              />
              <ProfileRow
                label="Next eligible"
                value={formatDate(user?.nextEligibleCheckIn)}
              />
            </dl>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Tips
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>
                ⏱️ Set a reminder shortly after each check-in window opens so
                you never miss the 48-hour grace period.
              </li>
              <li>
                🔐 Store your JWT securely—refresh tokens by re-authenticating
                whenever you log out.
              </li>
              <li>
                📈 Hero points climb automatically with every successful
                check-in. Track progress on the leaderboard.
              </li>
            </ul>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm dark:border-slate-800">
            <h2 className="text-base font-semibold">Session</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-200">
              <ProfileRow label="Authenticated" value={token ? "Yes" : "No"} />
              <ProfileRow label="JWT expiry" value="6 hours (default)" />
              <ProfileRow label="CORS origin" value="http://localhost:5173" />
            </dl>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Need a fresh token?
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Tokens expire after the configured window. Re-run the nonce +
              signature flow from the login page any time.
            </p>
            <Link
              to="/login"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Re-authenticate
            </Link>
          </article>
        </aside>
      </div>
    </section>
  );
}

function ProfileRow({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span
        className={`${
          mono ? "font-mono" : ""
        } text-sm font-semibold text-slate-900 dark:text-white`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}
