import { useState } from "react";
import { useNavigate } from "react-router";
import { ConnectButton } from "@mysten/dapp-kit";
import { useAuth } from "../providers/AuthProvider";

export const meta = () => [{ title: "Wallet Login • Streak" }];

export default function Login() {
  const { walletAddress, token, connectWallet, authenticate, loading } =
    useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function onAuthenticate() {
    try {
      setError(null);
      await authenticate();
      navigate("/dashboard");
    } catch (e) {
      setError((e as Error).message || "Authentication failed.");
    }
  }

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr,0.85fr]">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Authenticate your wallet
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            A secure nonce challenge keeps your streak tied to your address
            without ever requesting the private key.
          </p>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <dl className="grid gap-4 text-sm">
            <DetailRow
              label="Wallet address"
              value={
                walletAddress ? shortAddress(walletAddress) : "Not connected"
              }
              mono
            />
            <DetailRow
              label="Status"
              value={
                token
                  ? "Authenticated"
                  : walletAddress
                  ? "Wallet connected"
                  : "Awaiting connection"
              }
            />
            <DetailRow
              label="Next step"
              value={nextStepText({ token, walletAddress })}
            />
          </dl>
          <div className="mt-6 space-y-3">
            {!walletAddress && (
              <button
                type="button"
                onClick={() =>
                  void connectWallet().catch((e: unknown) =>
                    setError(
                      (e as Error)?.message ?? "Unable to connect wallet."
                    )
                  )
                }
                className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-105"
              >
                Connect wallet
              </button>
            )}
            {walletAddress && !token && (
              <button
                type="button"
                disabled={loading}
                onClick={() => void onAuthenticate()}
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105 disabled:opacity-60"
              >
                {loading ? "Authenticating…" : "Sign nonce & login"}
              </button>
            )}
            {token && (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Go to dashboard
              </button>
            )}
            {error && (
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <article className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Need a wallet selector?
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Use the universal connect button to pick from any supported Sui
            wallet. Once connected, return here to finish authentication.
          </p>
          <div className="mt-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <ConnectButton className="w-full" />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-sm text-slate-100 shadow-sm dark:border-slate-800">
          <h2 className="text-base font-semibold text-white">How it works</h2>
          <ol className="mt-4 space-y-3 list-decimal list-inside text-slate-200">
            <li>Connect your wallet and authorise read-only access.</li>
            <li>Request a nonce. We store it in Redis with a short TTL.</li>
            <li>
              Sign the nonce using a personal message and send it back to obtain
              your JWT.
            </li>
          </ol>
        </article>
      </aside>
    </section>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
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
        {value}
      </span>
    </div>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function nextStepText({
  token,
  walletAddress,
}: {
  token: string | null;
  walletAddress: string | null | undefined;
}) {
  if (token) return "You're authenticated—jump into the dashboard.";
  if (walletAddress) return "Sign the nonce challenge to receive your JWT.";
  return "Connect a supported Sui wallet to begin.";
}
