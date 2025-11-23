import type { ReactNode } from "react";
import { Link } from "react-router";
import { useAuth } from "../providers/AuthProvider";

export function Welcome() {
  const { token, user } = useAuth();

  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 px-6 py-16 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 md:px-12">
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-blue-600/15 via-indigo-500/10 to-transparent" />
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
              Powered by Sui wallets and daily streaks
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              Keep your streak alive, earn hero points, and climb the Sui leaderboard.
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Authenticate with your wallet, check in once per day, and watch your hero points grow. Miss more than 48 hours and the streak resets—consistency is everything.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to={token ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105"
              >
                {token ? "Open dashboard" : "Start your streak"}
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                View leaderboard
              </Link>
            </div>
            {token && user && (
              <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white/60 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 sm:grid-cols-3">
                <StreakStat label="Current streak" value={`${user.dailyStreak ?? 0} days`} />
                <StreakStat label="Hero points" value={user.heroPoints ?? 0} />
                <StreakStat label="Last check-in" value={formatDate(user.lastCheckIn)} />
              </div>
            )}
          </div>
          <div className="grid gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Why streaks matter
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Daily streaks keep your community active. Reward consistency with hero points that fuel leaderboards, unlock perks, or anchor game loops.
              </p>
              <dl className="mt-6 grid gap-4 text-sm">
                <FeatureItem title="Daily cadence" description="24 hour cooldown with a 48 hour grace period keeps streaks fair and predictable." />
                <FeatureItem title="Fair verification" description="Personal message signatures prevent abuse without asking users to share private keys." />
                <FeatureItem title="Redis-backed scaling" description="Nonces and rate limits live in Redis so your auth flow stays resilient." />
              </dl>
            </div>
            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white/60 p-6 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
              <StepItem step="01" title="Connect Sui wallet" description="Pick a supported wallet, authorise the connection, and get your address on file." />
              <StepItem step="02" title="Sign the nonce" description="We hand you a one-time nonce; you sign it to prove ownership without risking funds." />
              <StepItem step="03" title="Check in daily" description="Trigger the check-in endpoint once per day to keep the streak alive and points climbing." />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <HighlightCard
          title="Blazing-fast onboarding"
          description="Wallet connect + signature exchange completes in seconds thanks to Redis-backed nonce storage."
          icon={
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">⚡</span>
          }
        />
        <HighlightCard
          title="Transparent streak logic"
          description="Every check-in response shares your next eligible window, so your users always know when to return."
          icon={
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-600">📅</span>
          }
        />
        <HighlightCard
          title="Leaderboard ready"
          description="Real-time hero point rankings keep engagement high. Pull the top wallets with a single API request."
          icon={
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/10 text-indigo-600">🏆</span>
          }
        />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-900 px-6 py-12 text-white shadow-sm dark:border-slate-700 md:px-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr,1fr] md:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to launch your streak experience?
            </h2>
            <p className="text-sm leading-6 text-slate-200">
              Deploy the backend, point the frontend to your API, and invite your community. The stack is production-ready with Docker images, rate limiting, and secure JWT issuance.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Authenticate wallet
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore rankings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StreakStat({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{value ?? "-"}</p>
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  );
}

function StepItem({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {step}
      </span>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </div>
  );
}

function HighlightCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      {icon}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>
    </article>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}
