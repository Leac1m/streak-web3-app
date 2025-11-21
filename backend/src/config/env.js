import dotenv from 'dotenv';
import assert from 'assert';

dotenv.config();

const required = [
  'MONGO_URI',
  'JWT_SECRET',
  'REDIS_URL',
  'REDIS_PORT'
];

for (const key of required) {
  assert(process.env[key], `Missing required env var: ${key}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  // JWT expiry in hours (default 6 hours). If legacy JWT_EXPIRY_DAYS is present, convert to hours.
  jwtExpiryHours: (() => {
    if (process.env.JWT_EXPIRY_HOURS) return parseInt(process.env.JWT_EXPIRY_HOURS, 10);
    if (process.env.JWT_EXPIRY_DAYS) return parseInt(process.env.JWT_EXPIRY_DAYS, 10) * 24;
    return 6;
  })(),
  redis: {
    url: process.env.REDIS_URL,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  tonNetwork: process.env.TON_NETWORK || 'mainnet'
  ,
  rateLimit: {
    windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '900', 10), // 15 minutes default
    maxAuth: parseInt(process.env.RATE_LIMIT_MAX_AUTH || '20', 10),
    maxNonce: parseInt(process.env.RATE_LIMIT_MAX_NONCE || '30', 10)
  }
};

export const isProd = env.nodeEnv === 'production';