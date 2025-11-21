export const meta = () => [{ title: "Leaderboard • TON Streak" }];

export default function Leaderboard() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Leaderboard</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Top users by hero points.
      </p>
      {/* TODO: Table of top 10 users fetched from /api/leaderboard */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <p>Coming soon…</p>
      </div>
    </section>
  );
}
