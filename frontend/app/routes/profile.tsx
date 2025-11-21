import { useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";

export const meta = () => [{ title: "Profile • TON Streak" }];

export default function Profile() {
  const { user, token, refreshProfile } = useAuth();

  useEffect(() => {
    if (token) refreshProfile();
  }, [token, refreshProfile]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Your account details and history.
      </p>
      {/* TODO: Display wallet address and full stats from /api/profile */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <p>Wallet: {user?.walletAddress ?? "—"}</p>
        <p>Streak: {user?.dailyStreak ?? "—"}</p>
        <p>Hero Points: {user?.heroPoints ?? "—"}</p>
        <p>Last Check-in: {user?.lastCheckIn ?? "—"}</p>
      </div>
    </section>
  );
}
