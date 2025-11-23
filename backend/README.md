# Backend Service

## Overview

- Node.js + Express API that powers the Streak web3 experience
- Sui wallet authentication using a Redis-backed nonce challenge
- Persistent user, streak, and hero point data stored in MongoDB
- Daily check-in workflow with 24 h gating and 48 h grace before streak reset
- Rate limiting backed by Redis and uniform API error handling
- Interactive Swagger UI available at `http://localhost:5000/`

## Prerequisites

- Node.js 20 or newer (Corepack recommended)
- pnpm 10+
- MongoDB 7+
- Redis 7+

## Environment Setup

1. `cd backend`
2. Copy the example file and populate secrets: `cp .env.example .env`
3. Provide values for `MONGO_URI`, `JWT_SECRET`, `REDIS_URL`, and `REDIS_PORT`
4. Enable Corepack (once per machine): `corepack enable`
5. Install dependencies: `pnpm install`

### Starting MongoDB & Redis locally

Use your preferred installation, or spin up the compose services:

```bash
docker compose up -d mongo redis
```

## Local Development

```bash
pnpm dev
```

- Runs the server with nodemon on `http://localhost:5000`
- API routes are mounted under `/api`
- Swagger UI is served at `/` (root)

Use `pnpm start` for a production-style process without autoreload.

## Health Check

Validate connectivity to MongoDB and Redis:

```bash
node ./scripts/health-check.js
```

Exit code `0` indicates success. The script prints latency metrics for both stores.

## Docker & Compose

- Multi-stage `Dockerfile` (pnpm-based) builds a minimal production image that runs as the non-root `node` user.
- Build and run the backend image manually:
  ```bash
  docker build -t streak-backend ./backend
  docker run --env-file ./backend/.env -p 5000:5000 streak-backend
  ```
- Use the top-level `docker-compose.yml` to launch MongoDB, Redis, and the backend together:
  ```bash
  docker compose up --build
  ```
  The backend will be reachable at `http://localhost:5000`. Update `.env` if you change exposed ports or service names.
- Tear everything down (including volumes):
  ```bash
  docker compose down -v
  ```

## Scripts

| Script                         | Purpose                            |
| ------------------------------ | ---------------------------------- |
| `pnpm dev`                     | Start the API with autoreload      |
| `pnpm start`                   | Start the API in production mode   |
| `node scripts/health-check.js` | Check MongoDB & Redis connectivity |

## Streak & Hero Points Logic

- First successful check-in starts the streak at `1` and awards `+10` hero points.
- Subsequent check-ins within 48 hours of the previous one increment the streak and award `+10` points.
- Users become eligible for the next check-in 24 hours after the latest success (`nextEligibleAt`).
- Missing a check-in for more than 48 hours resets the streak to `1`, but still awards the daily points.

## Rate Limiting

Redis-backed fixed window counters protect sensitive endpoints.

| Endpoint               | Default window | Limit       |
| ---------------------- | -------------- | ----------- |
| `POST /api/auth/nonce` | 15 minutes     | 30 requests |
| `POST /api/auth`       | 15 minutes     | 20 requests |

Adjust the window or limits with `RATE_LIMIT_WINDOW_SECONDS`, `RATE_LIMIT_MAX_NONCE`, and `RATE_LIMIT_MAX_AUTH`.
Responses above the limit return HTTP `429` with headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`

The response payload includes a `retryAfterSeconds` hint.

## Authentication Flow (Sui wallet)

1. Client requests `POST /api/auth/nonce` with a Sui wallet address.
2. Backend creates a nonce, stores it in Redis for 5 minutes (`nonce:<address>`) and returns it.
3. Client signs the nonce via the Sui wallet (personal message signature).
4. Client submits `POST /api/auth` with `{ walletAddress, signature, nonce }`.
5. Backend verifies the signature using `@mysten/sui`, deletes the nonce, upserts the user, and issues a JWT (`env.JWT_EXPIRY_HOURS`, default 6h).
6. Client uses `Authorization: Bearer <token>` for protected endpoints (`/api/profile`, `/api/check-in`).

### Sample Requests

Request nonce:

```bash
curl -X POST http://localhost:5000/api/auth/nonce \
	-H "Content-Type: application/json" \
	-d '{"walletAddress":"0x1234abcd..."}'
```

Authenticate:

```bash
curl -X POST http://localhost:5000/api/auth \
	-H "Content-Type: application/json" \
	-d '{"walletAddress":"0x1234abcd...","signature":{"signature":"..."},"nonce":"uuid"}'
```

Fetch profile:

```bash
curl -H "Authorization: Bearer <jwt>" http://localhost:5000/api/profile
```

Submit check-in:

```bash
curl -X POST \
	-H "Authorization: Bearer <jwt>" \
	http://localhost:5000/api/check-in
```

## API Reference

| Method | Path                         | Auth              | Description                                        |
| ------ | ---------------------------- | ----------------- | -------------------------------------------------- |
| GET    | `/api/`                      | No                | Health/status ping                                 |
| POST   | `/api/auth/nonce`            | No (rate limited) | Issue a short-lived nonce for Sui signature        |
| POST   | `/api/auth`                  | No (rate limited) | Verify signature and issue JWT + user payload      |
| GET    | `/api/leaderboard?limit=<n>` | No                | Fetch top users sorted by hero points (default 20) |
| GET    | `/api/profile`               | Bearer            | Return the authenticated user's profile and streak |
| POST   | `/api/check-in`              | Bearer            | Perform the daily check-in and update streak       |

All error responses share this structure:

```json
{
  "success": false,
  "message": "Human readable summary",
  "details": []
}
```

The shared error shape is enforced by `ApiError` utilities (`src/utils/ApiError.js`) and the central handler registered in `src/app.js`.

## Environment Variables

| Variable                    | Required | Default                 | Notes                                                       |
| --------------------------- | -------- | ----------------------- | ----------------------------------------------------------- |
| `MONGO_URI`                 | ✅       | –                       | MongoDB connection string                                   |
| `JWT_SECRET`                | ✅       | –                       | Strong random secret for JWT signing                        |
| `REDIS_URL`                 | ✅       | –                       | Redis host (Compose uses `redis`)                           |
| `REDIS_PORT`                | ✅       | `6379`                  | Redis TCP port                                              |
| `PORT`                      | ❌       | `5000`                  | API listening port                                          |
| `JWT_EXPIRY_HOURS`          | ❌       | `6`                     | JWT lifetime in hours                                       |
| `JWT_EXPIRY_DAYS`           | Legacy   | –                       | Converted to hours if set                                   |
| `CORS_ORIGIN`               | ❌       | `http://localhost:5173` | Allowed browser origin                                      |
| `TON_NETWORK`               | ❌       | `mainnet`               | Placeholder for wallet network selection (currently unused) |
| `REDIS_USERNAME`            | ❌       | –                       | For Redis ACL setups                                        |
| `REDIS_PASSWORD`            | ❌       | –                       | For password-protected Redis                                |
| `RATE_LIMIT_WINDOW_SECONDS` | ❌       | `900`                   | Fixed-window duration in seconds                            |
| `RATE_LIMIT_MAX_AUTH`       | ❌       | `20`                    | Auth attempts allowed per window                            |
| `RATE_LIMIT_MAX_NONCE`      | ❌       | `30`                    | Nonce requests allowed per window                           |

## Troubleshooting

| Symptom                                         | Likely cause              | Resolution                                                 |
| ----------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| Startup exits with `Missing required env var`   | `.env` incomplete         | Add the missing keys and restart                           |
| `Redis Error: connect ECONNREFUSED`             | Redis not reachable       | Ensure Redis is running and `REDIS_URL`/`REDIS_PORT` match |
| `Rate limit exceeded` responses                 | Hitting configured limits | Wait for the TTL or increase thresholds in `.env`          |
| 401 responses on protected routes               | Token expired or invalid  | Re-run the wallet auth flow to obtain a new JWT            |
| Docker build fails (`pnpm-lock.yaml` not found) | Lockfile ignored          | Ensure `.dockerignore` allows the lockfile                 |

## Security & Operations

- Always serve the API behind HTTPS in production (TLS termination via proxy/ingress).
- Rotate `JWT_SECRET` periodically; revoke or expire existing tokens as needed.
- Back up MongoDB and configure Redis persistence/monitoring when running in production.
- Consider adding structured logging, metrics, and alerting before launch.
