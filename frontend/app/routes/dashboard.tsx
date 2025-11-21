import { useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";

export const meta = () => [{ title: "Dashboard • TON Streak" }];

export default function Dashboard() {
  const { user, refreshProfile, checkIn, loading, token } = useAuth();

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token, refreshProfile]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Your streak and daily check-in.
      </p>
      {/* TODO: Show profile stats + check-in button linked to /api/check-in */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">Streak: {user?.dailyStreak ?? "—"}</div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">Hero Points: {user?.heroPoints ?? "—"}</div>
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">Next Eligible: {user?.nextEligibleCheckIn ?? "—"}</div>
      </div>
      <button
        disabled={loading || !token}
        onClick={() => void checkIn()}
        className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Working..." : "Check In"}
      </button>
    </section>
  );
}
