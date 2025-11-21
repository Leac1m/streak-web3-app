interface FrontendEnv {
  VITE_API_BASE: string;
  VITE_APP_NAME: string;
  VITE_ENABLE_MOCKS: boolean;
  VITE_TON_NETWORK: string;
  VITE_LOG_LEVEL: string;
}

function readEnv(): FrontendEnv {
  const raw = import.meta.env;
  return {
    VITE_API_BASE: (raw.VITE_API_BASE as string) || 'http://localhost:5000/api',
    VITE_APP_NAME: (raw.VITE_APP_NAME as string) || 'Ton Streak',
    VITE_ENABLE_MOCKS: (raw.VITE_ENABLE_MOCKS as string) === 'true',
    VITE_TON_NETWORK: (raw.VITE_TON_NETWORK as string) || 'mainnet',
    VITE_LOG_LEVEL: (raw.VITE_LOG_LEVEL as string) || 'info'
  };
}

export const env = readEnv();
export const isMockMode = env.VITE_ENABLE_MOCKS;
