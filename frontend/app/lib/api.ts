import { env } from "../../src/config/env";

const TOKEN_KEY = "token";
const TOKEN_EXP_KEY = "token_exp";
const TOKEN_SKEW_MS = 30_000;

type TokenState = {
  token: string | null;
  expired: boolean;
};

export class TokenExpiredError extends Error {
  constructor(message = "Session expired. Please log in again.") {
    super(message);
    this.name = "TokenExpiredError";
  }
}

export function getToken(): string | null {
  return readTokenState().token;
}

export function getTokenExpiry(): number | null {
  if (!hasStorage()) return null;
  const raw = localStorage.getItem(TOKEN_EXP_KEY);
  if (!raw) return null;
  const expiresAt = Number(raw);
  return Number.isFinite(expiresAt) ? expiresAt : null;
}

export function setToken(token: string | null) {
  if (!hasStorage()) return;
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXP_KEY);
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  const expiresAt = decodeJwtExpiry(token);
  if (expiresAt) localStorage.setItem(TOKEN_EXP_KEY, String(expiresAt));
  else localStorage.removeItem(TOKEN_EXP_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body)
    headers.set("Content-Type", "application/json");

  const { token, expired } = readTokenState();
  if (expired) throw new TokenExpiredError();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${env.VITE_API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const msg = await safeJson(res);
    throw new Error(msg?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

function readTokenState(): TokenState {
  if (!hasStorage()) return { token: null, expired: false };

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return { token: null, expired: false };

  const expiresRaw = localStorage.getItem(TOKEN_EXP_KEY);
  const expiresAt = expiresRaw ? Number(expiresRaw) : null;
  const expired = isExpired(expiresAt);

  if (expired) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXP_KEY);
    return { token: null, expired: true };
  }

  return { token, expired: false };
}

function decodeJwtExpiry(token: string): number | null {
  const [, payloadSegment] = token.split(".");
  if (!payloadSegment) return null;

  try {
    const payloadJson = base64UrlDecode(payloadSegment);
    const payload = JSON.parse(payloadJson);
    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  if (typeof globalThis.atob === "function") return globalThis.atob(padded);
  if (typeof Buffer !== "undefined") return Buffer.from(padded, "base64").toString("utf-8");

  throw new Error("No base64 decoder available");
}

function isExpired(expiresAt: number | null): boolean {
  if (!expiresAt || Number.isNaN(expiresAt)) return false;
  return Date.now() >= expiresAt - TOKEN_SKEW_MS;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
