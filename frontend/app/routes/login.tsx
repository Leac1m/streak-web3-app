import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router";

export const meta = () => [{ title: "Login Web3 Streak" }];

export default function Login() {
  const { walletAddress, token, connectWallet, authenticate, loading } = useAuth();
  const navigate = useNavigate();

  async function onAuthenticate() {
    try {
      await authenticate();
      navigate("/dashboard");
    } catch (e: any) {
      alert(e?.message || "Authentication failed");
    }
  }
  return (
    <section className="space-y-4 max-w-md">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Authenticate with your wallet.
      </p>
      {/* TODO: Connect wallet, request nonce, sign, and POST /api/auth */}
      <div className="space-y-3">
        <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3 text-sm">
          Wallet: {walletAddress ? (
            <span className="text-green-600">{walletAddress}</span>
          ) : (
            <span className="text-gray-500">Not connected</span>
          )}
        </div>

        {!walletAddress && (
          <button
            type="button"
            onClick={connectWallet}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        )}

        {walletAddress && !token && (
          <button
            type="button"
            disabled={loading}
            onClick={onAuthenticate}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        )}

        {token && (
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </section>
  );
}
