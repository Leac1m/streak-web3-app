import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../providers/AuthProvider";

export const meta = () => [{ title: "Dashboard • Streak" }];

export default function Dashboard() {
  const { user, refreshProfile, checkIn, loading, token } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      refreshProfile().catch(() => {
        setError("Failed to load profile. Please try again.");
      });
    }
  }, [token, refreshProfile]);

  const nextEligible = useMemo(
    () => formatDate(user?.nextEligibleCheckIn),
    [user?.nextEligibleCheckIn]
  );

  const lastCheckIn = useMemo(
    () => formatDate(user?.lastCheckIn),
    [user?.lastCheckIn]
  );

  const waitingPeriod = useMemo(
    () => timeUntil(user?.nextEligibleCheckIn),
    [user?.nextEligibleCheckIn]
  );

  async function onCheckIn() {
    try {
      setError(null);
      setMessage(null);
      await checkIn();
      setMessage("Check-in recorded. Keep the momentum going!");
    } catch (err) {
      setError((err as Error).message ?? "Unable to complete check-in.");
    }
  }

  if (!token) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Connect your wallet and authenticate to start building your streak.
          </p>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <p className="text-slate-600 dark:text-slate-300">
            You need to be signed in to view streak insights. Head to the login
            page to connect your wallet and authenticate with a one-time nonce.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105"
          >
            Go to wallet login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Track your streak stats, check eligibility, and trigger the daily
          check-in.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Current streak"
          value={`${user?.dailyStreak ?? 0} days`}
          accent="from-blue-600 to-indigo-600"
        />
        <StatCard
          title="Hero points"
          value={user?.heroPoints ?? 0}
          accent="from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Last check-in"
          value={lastCheckIn}
          accent="from-amber-500 to-orange-500"
        />
        <StatCard
          title="Next eligible"
          value={nextEligible}
          accent="from-slate-600 to-slate-900"
          helper={waitingPeriod}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Daily check-in
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Stay consistent by checking in once every 24 hours. You have a
            48-hour grace period before the streak resets.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onCheckIn()}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Check in now"}
          </button>
          {message && (
            <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <TimelineItem
            title="24h cooldown"
            description="You become eligible again exactly 24 hours after your last successful check-in."
          />
          <TimelineItem
            title="48h grace period"
            description="Miss a day? You still have up to 48 hours from the last check-in before the streak resets to day one."
          />
          <TimelineItem
            title="+10 hero points"
            description="Each successful check-in awards ten points. Points feed the public leaderboard automatically."
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  accent,
  helper,
}: {
  title: string;
  value: string | number;
  accent: string;
  helper?: string | null;
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent}`}
      />
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
        {value}
      </p>
      {helper && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {helper}
        </p>
      )}
    </article>
  );
}

function TimelineItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </article>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function timeUntil(value?: string | null) {
  if (!value) return null;
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return "You can check in now.";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.round((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours <= 0)
    return `${minutes} minute${minutes === 1 ? "" : "s"} until eligible`;
  const minutePart = minutes ? ` ${minutes}m` : "";
  return `${hours} hour${hours === 1 ? "" : "s"}${minutePart} remaining`;
}
