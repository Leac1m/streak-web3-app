#!/usr/bin/env node
import mongoose from 'mongoose';
import Redis from 'ioredis';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Load env relative to backend root when executed from anywhere
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ton_streak';
const redisHost = process.env.REDIS_URL || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

async function checkMongo() {
  const start = Date.now();
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
  await mongoose.connection.db.admin().ping();
  const ms = Date.now() - start;
  await mongoose.disconnect();
  return { status: 'ok', latencyMs: ms };
}

async function checkRedis() {
  const start = Date.now();
  const redis = new Redis({ host: redisHost, port: redisPort, lazyConnect: true, connectTimeout: 3000 });
  await redis.connect();
  await redis.ping();
  const ms = Date.now() - start;
  await redis.quit();
  return { status: 'ok', latencyMs: ms };
}

(async () => {
  const results = { mongo: null, redis: null };
  try {
    results.mongo = await checkMongo();
  } catch (e) {
    results.mongo = { status: 'error', error: e.message };
  }
  try {
    results.redis = await checkRedis();
  } catch (e) {
    results.redis = { status: 'error', error: e.message };
  }
  const exitCode = (results.mongo.status === 'ok' && results.redis.status === 'ok') ? 0 : 1;
  console.log(JSON.stringify(results, null, 2));
  process.exit(exitCode);
})();
