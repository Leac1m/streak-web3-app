import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api, getToken, setToken } from "../lib/api";

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
  connectWallet: () => void;
  disconnectWallet: () => void;
  authenticate: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkIn: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthInnerProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = useCallback(() => {
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
  }, []);

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
    } finally {
      setLoading(false);
    }
  }, [token]);

  const checkIn = useCallback(async () => {
    if (!token) throw new Error("Not authenticated");
    setLoading(true);
    try {
      await api.post<{ message: string }>("/check-in");
      await refreshProfile();
    } finally {
      setLoading(false);
    }
  }, [token, refreshProfile]);

  const authenticate = useCallback(async () => {
    if (!walletAddress) throw new Error("Connect wallet first");
    setLoading(true);
    try {
      // 1) Request server nonce
      const { nonce } = await api.post<{ nonce: string }>("/auth/nonce", {
        walletAddress,
      });


      // 2) Ask user to sign the nonce (placeholder: TODO integrate sign feature)
      // NOTE: Implement SUI sign once enabled. For now, we pass nonce back as message
      const signature = "0kkkkk"; // TODO: use signTransacture to create a signature when available

      // 3) Submit auth
      const result = await api.post<{ token: string; user: UserProfile }>(
        "/auth",
        {
          walletAddress,
          signature,
          nonce,
        }
      );

      setToken(result.token);
      setTokenState(result.token);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  const value = useMemo<AuthContextValue>(
    () => ({
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
      <AuthInnerProvider>{children}</AuthInnerProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
