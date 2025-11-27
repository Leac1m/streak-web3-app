import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  SuiClientProvider,
  WalletProvider,
  useConnectWallet,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSignPersonalMessage,
  useWallets,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

import {
  api,
  getToken,
  getTokenExpiry,
  setToken,
  TokenExpiredError,
} from "../lib/api";
import networkConfig from "src/config/networkConfig";

// Types
export type UserProfile = {
  walletAddress: string;
  heroPoints: number;
  dailyStreak?: number;
  lastCheckIn?: string;
  nextEligibleCheckIn?: string;
};

export type AuthContextValue = {
  walletAddress: string | null;
  token: string | null;
  user: UserProfile | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  authenticate: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkIn: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthInnerProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getToken()
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const { mutateAsync: connect } = useConnectWallet();
  const { currentWallet } = useCurrentWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;

  const wallets = useWallets();

  const connectWallet = useCallback(async () => {
    if (currentWallet) return;
    if (!wallets.length) {
      throw new Error(
        "No Sui wallets detected. Please install a compatible wallet."
      );
    }

    if (wallets.length === 1) {
      await connect({ wallet: wallets[0]! });
      return;
    }

    throw new Error(
      "Multiple wallets available. Use the Connect button to choose one."
    );
  }, [connect, currentWallet, wallets]);

  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.get<UserProfile>("/profile");
      setUser(data);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        logout();
        return;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const checkIn = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      await api.post<{ message: string }>("/check-in");
      await refreshProfile();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        logout();
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token, refreshProfile, logout]);

  const authenticate = useCallback(async () => {
    if (!walletAddress) throw new Error("Connect wallet first");
    setLoading(true);
    try {
      // 1) Request server nonce
      const { nonce, message } = await api.post<{ nonce: string; message: string }>(
        "/auth/nonce",
        {
          walletAddress,
        }
      );

      // 2) Ask user to sign the nonce
      const signature = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });

      // 3) Submit auth
      const result = await api.post<{ token: string; user: UserProfile }>(
        "/auth",
        {
          walletAddress,
          signature,
          nonce,
          message,
        }
      );

      setToken(result.token);
      setTokenState(result.token);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, signPersonalMessage]);

  useEffect(() => {
    if (token) {
      refreshProfile().catch((error) => {
        if (error instanceof TokenExpiredError) return;
        console.error("Failed to refresh profile", error);
      });
    } else {
      setUser(null);
    }
  }, [token, refreshProfile]);

  useEffect(() => {
    if (!walletAddress && (token || user)) {
      logout();
    }
  }, [walletAddress, token, user, logout]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!token) return;

    const expiresAt = getTokenExpiry();
    if (!expiresAt) return;

    const now = Date.now();
    if (expiresAt <= now) {
      logout();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      logout();
    }, expiresAt - now);

    return () => window.clearTimeout(timeoutId);
  }, [token, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      walletAddress: walletAddress || null,
      token,
      user,
      loading,
      connectWallet,
      disconnectWallet,
      authenticate,
      refreshProfile,
      checkIn,
      logout,
    }),
    [
      walletAddress,
      token,
      user,
      loading,
      connectWallet,
      disconnectWallet,
      authenticate,
      refreshProfile,
      checkIn,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect slushWallet={{ name: "streak"}} >
          <AuthInnerProvider>{children}</AuthInnerProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
