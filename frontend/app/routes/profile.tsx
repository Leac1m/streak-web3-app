export const meta = () => [{ title: "Profile • TON Streak" }];

export default function Profile() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Your account details and history.
      </p>
      {/* TODO: Display wallet address and full stats from /api/profile */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <p>Wallet: —</p>
        <p>Streak: —</p>
        <p>Hero Points: —</p>
        <p>Last Check-in: —</p>
      </div>
    </section>
  );
}
