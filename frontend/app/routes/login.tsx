export const meta = () => [{ title: "Login • TON Streak" }];

export default function Login() {
  return (
    <section className="space-y-4 max-w-md">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Authenticate with your TON wallet.
      </p>
      {/* TODO: Connect wallet, request nonce, sign, and POST /api/auth */}
      <form className="space-y-3">
        <input
          type="text"
          name="walletAddress"
          placeholder="Wallet Address"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
        />
        <button
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Continue with Wallet
        </button>
      </form>
    </section>
  );
}
