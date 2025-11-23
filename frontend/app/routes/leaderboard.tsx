import { useEffect, useState } from "react";
import { api } from "../lib/api";

type LeaderboardEntry = {
  walletAddress: string;
  heroPoints: number;
  rank: number;
};

export const meta = () => [{ title: "Leaderboard • Streak" }];

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get<{ leaderboard: LeaderboardEntry[] }>("/leaderboard?limit=20")
      .then((data) => {
        if (!mounted) return;
        setRows(data.leaderboard ?? []);
      })
      .catch((err: Error) => {
        if (!mounted) return;
        setError(err.message || "Could not load leaderboard.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Leaderboard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Real-time ranking of wallets by hero points. Updated whenever a user
          checks in.
        </p>
      </header>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Wallet</th>
              <th className="px-5 py-4">Hero points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading && (
              <tr>
                <td className="px-5 py-6" colSpan={3}>
                  <SkeletonRow />
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td className="px-5 py-6" colSpan={3}>
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td className="px-5 py-6" colSpan={3}>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    No streak data yet. Be the first to check in!
                  </p>
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.map((row) => (
                <tr
                  key={row.rank}
                  className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/50"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    #{row.rank}
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                    {shortAddress(row.walletAddress)}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                    {row.heroPoints.toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-6">
      <span className="h-4 w-12 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      <span className="h-4 flex-1 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      <span className="h-4 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
