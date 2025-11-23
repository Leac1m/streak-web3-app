# Streak Web3 App

Full-stack application that lets Sui wallet holders maintain daily streaks, earn hero points, and climb a leaderboard. The repository contains an Express backend, a React Router + Vite frontend, and Docker assets for running the stack with MongoDB and Redis.

## Project Layout

| Path                 | Description                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `backend/`           | Node.js API (Express, MongoDB, Redis, Swagger). See `backend/README.md` for deep dives.           |
| `frontend/`          | React Router app bootstrapped with Vite. Handles wallet flows, profile views, and streak actions. |
| `docker-compose.yml` | Spins up MongoDB, Redis, and the backend container for local or staging use.                      |

## Prerequisites

- Node.js 20+ with Corepack enabled (`corepack enable`)
- pnpm 10+
- Docker & Docker Compose (for container-based workflows)

## Environment Variables

### Backend

1. `cd backend`
2. Copy `.env.example` to `.env`
3. Fill in the required values (`MONGO_URI`, `JWT_SECRET`, `REDIS_URL`, `REDIS_PORT`, etc.)
4. Refer to `backend/README.md` for the full variable matrix and descriptions.

### Frontend

1. `cd frontend`
2. Copy `.env.example` to `.env`
3. Set `VITE_API_BASE` to the backend URL (default `http://localhost:5000/api`)

## Install Dependencies

```bash
cd backend && pnpm install
cd ../frontend && pnpm install
```

(Use separate terminals or shells to keep both servers running.)

## Run in Development

### Backend API

```bash
cd backend
pnpm dev
```

- Serves Swagger UI at `http://localhost:5000/`
- REST endpoints mounted under `http://localhost:5000/api`

### Frontend

```bash
cd frontend
pnpm dev
```

- Runs on `http://localhost:5173`
- Uses `VITE_API_BASE` to reach the backend

## Docker & Compose

### Backend + Datastores

```bash
docker compose up --build
```

- Launches MongoDB (`mongo`), Redis (`redis`), and the API (`backend`)
- Backend becomes available on `http://localhost:5000`

Tear down (including Mongo volume):

```bash
docker compose down -v
```

### Frontend Container (optional)

There is a `frontend/Dockerfile` based on pnpm and Vite. Build and run it directly if you want a containerized frontend:

```bash
cd frontend
docker build -t streak-frontend .
docker run -p 5173:5173 streak-frontend
```

(You can extend `docker-compose.yml` with a `frontend` service if you prefer a single command.)

## Health Checks & Utilities

- Backend: `pnpm start` (production mode) or `node scripts/health-check.js` to verify Mongo/Redis connectivity.
- Swagger: visit `http://localhost:5000/` after the backend starts to explore endpoints.

## Additional Notes

- Authentication relies on Sui wallet personal-message signatures, backed by Redis-stored nonces.
- Daily check-ins enforce a 24 h cooldown with a 48 h grace period before streak reset.
- Rate limiting protects `/api/auth` and `/api/auth/nonce`; adjust window and limits via environment variables.

For more detail, consult `backend/README.md` and the inline docs throughout the codebase.
