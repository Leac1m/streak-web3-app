# Backend Service

## Overview

Node.js Express backend providing authentication, profile, leaderboard, and check-in endpoints for the streak web3 app.

## Requirements

- Node.js 18+ (recommended 20+)
- pnpm (managed via corepack)
- MongoDB 7+
- Redis 7+

## Environment Setup

Copy `.env.example` to `.env` and adjust values.

Required variables (validated at runtime):

- `MONGO_URI`
- `JWT_SECRET`
- `REDIS_URL`
- `REDIS_PORT`

Optional:

- `PORT` (default 5000)
- `JWT_EXPIRY_HOURS` (default 6) – legacy `JWT_EXPIRY_DAYS` will still be honored if present (converted to hours)
- `CORS_ORIGIN` (default http://localhost:5173)
- `TON_NETWORK` (default mainnet)

## Development

```bash
cd backend
pnpm install
pnpm dev
```

## Health Check

Run a connectivity test to MongoDB and Redis:

```bash
node ./scripts/health-check.js
```

Exit code 0 means OK. Output includes latency.

## Docker

A multi-stage `Dockerfile` is provided.

Build and run backend only:

```bash
docker build -t streak-backend ./backend
docker run --env-file ./backend/.env -p 5000:5000 streak-backend
```

## Docker Compose (Backend + Mongo + Redis)

Top-level `docker-compose.yml` spins up all services.

```bash
docker compose up --build
```

Backend accessible at `http://localhost:5000`.

To tear down:

```bash
docker compose down -v
```

## Environment Adjustments for Compose

Compose overrides host references so backend reaches services by internal names:

- `MONGO_URI=mongodb://mongo:27017/ton_streak`
- `REDIS_URL=redis`

## Production Notes

- Use a stronger `JWT_SECRET` (generated automatically by prior setup script or via `openssl rand -hex 48`).
- Consider enabling rate limiting & request logging.
- Run MongoDB & Redis with persistence and backups.

## Scripts

| Script                    | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `scripts/health-check.js` | Connectivity validation for Mongo & Redis |

## Swagger

Swagger docs appear if `src/swagger.js` is wired and route exposed (check implementation).

## Next Improvements (Optional)

- Add rate limiting middleware.
- Add structured logging (pino / winston).
- Add tests & CI pipeline.
