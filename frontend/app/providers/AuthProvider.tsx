import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CHAIN,
  TonConnectUIProvider,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
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
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();

  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Track wallet connection state
  useEffect(() => {
    const addr = wallet?.account?.address || null;
    setWalletAddress(addr);
  }, [wallet]);

  const connectWallet = useCallback(() => {
    tonConnectUI.openModal();
  }, [tonConnectUI]);

  const disconnectWallet = useCallback(() => {
    tonConnectUI.disconnect();
    setWalletAddress(null);
  }, [tonConnectUI]);

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
      // Build message expected by backend (suffix must match)
      const message = `Please sign this message to verify your identity. Nonce: ${nonce}`;
      // const domain = "https://tonconnect-sdk-demo-dapp.vercel.app"// window.location.host;

      // 2) Request signature from wallet via TonConnect (text signing)
      const { signature, timestamp, address, domain, payload } = await tonConnectUI.signData({
        type: "text",
        text: message,
      });
      console.log("Signature received", { signature, timestamp });

      // 3) Submit auth with expanded payload
      const publicKey = wallet?.account?.publicKey;
      if (!publicKey) throw new Error("Missing public key from wallet");

      const result = await api.post<{ token: string; user: UserProfile }>("/auth", {
        walletAddress,
        publicKey,
        signature,
        nonce,
        message: payload!.text,
        domain,
        timestamp: timestamp, // fallback if library doesn't return timestamp
      });

      setToken(result.token);
      setTokenState(result.token);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, tonConnectUI, wallet]);

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
    <TonConnectUIProvider manifestUrl="https://tonconnect-sdk-demo-dapp.vercel.app/tonconnect-manifest.json">
      <AuthInnerProvider>{children}</AuthInnerProvider>
    </TonConnectUIProvider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
