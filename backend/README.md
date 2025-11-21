# Backend Service

## Overview

Node.js Express backend providing authentication, profile, leaderboard, and check-in endpoints for the streak web3 app.

API base URL (default): `http://localhost:5000/api`

Interactive docs (Swagger UI): `http://localhost:5000/docs`

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

Additional (optional) rate limiting overrides:

- `RATE_LIMIT_WINDOW_SECONDS` (default 900)
- `RATE_LIMIT_MAX_AUTH` (default 20)
- `RATE_LIMIT_MAX_NONCE` (default 30)

Legacy support:

- `JWT_EXPIRY_DAYS` (converted to hours if `JWT_EXPIRY_HOURS` absent)

## Development

```bash
cd backend
pnpm install
pnpm dev
```

Use `pnpm start` to run without autoreload (production style).

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

Note: Ensure `pnpm-lock.yaml` is included in build context (not ignored) for reproducible installs.

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
  - Rate limiting is available via Redis fixed window counters (see Rate Limiting section).
- Run MongoDB & Redis with persistence and backups.
- Run container as non-root (Dockerfile sets `USER node` in production stage).
- Keep lockfile (`pnpm-lock.yaml`) in image for auditability.

## Scripts

| Script                    | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `scripts/health-check.js` | Connectivity validation for Mongo & Redis |

## Error Handling & Validation

All API responses follow a consistent error shape:

```
{
	"success": false,
	"message": "Human readable summary",
	"details": [
		{ "message": "\"walletAddress\" is required", "path": ["walletAddress"] }
	] // optional (present for validation failures)
}
```

Components:

- `ApiError` utility (`src/utils/ApiError.js`) encapsulates `statusCode`, `message`, optional `details`.
- Central error handler in `src/app.js` converts thrown `ApiError` instances to JSON responses.
- Validation middleware (`src/middlewares/validate.js`) uses Joi to validate `req.body`, `req.query`, and `req.params` and sanitizes input.
- Common schemas: walletAddress, signature, nonce, leaderboard limit.

Usage Pattern:

```js
import { validate } from "../middlewares/validate.js";
router.post(
  "/auth",
  validate({ body: Joi.object({ walletAddress: schemas.walletAddress }) }),
  controller
);
```

Throwing Errors:

```js
import { badRequest } from "../utils/ApiError.js";
if (!condition) throw badRequest("Invalid state");
```

Validation Failures return status 400 with a `details` array from Joi.
Uncaught errors produce a 500 with `message: "Internal server error"`.

## Rate Limiting

Auth endpoints are rate limited using Redis counters:

| Endpoint      | Default Window | Max Requests |
| ------------- | -------------- | ------------ |
| `/auth/nonce` | 15 minutes     | 30           |
| `/auth`       | 15 minutes     | 20           |

Configuration variables (optional):

```
RATE_LIMIT_WINDOW_SECONDS=900
RATE_LIMIT_MAX_AUTH=20
RATE_LIMIT_MAX_NONCE=30
```

Responses exceeding limits return `429`:

```
{
	"success": false,
	"message": "Rate limit exceeded",
	"details": { "retryAfterSeconds": 742 }
}
```

Headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`

## API Usage

### Authentication Flow (TON Wallet)

1. Request nonce with wallet address.
2. Sign nonce message (implementation in frontend/wallet layer).
3. Exchange signature + nonce for JWT.
4. Use `Authorization: Bearer <token>` for protected endpoints.

### Endpoints Summary

| Method | Path | Protected | Description |
| ------ | ---- | --------- | ----------- |
| GET | `/api/` | No | Health/status ping |
| POST | `/api/auth/nonce` | No (rate limited) | Generate one-time nonce for signature |
| POST | `/api/auth` | No (rate limited) | Verify signature & issue JWT |
| GET | `/api/leaderboard?limit=<n>` | No | Top users by hero points (default 10) |
| POST | `/api/check-in` | Yes | Daily check-in to advance streak |
| GET | `/api/profile` | Yes | Current user profile & streak |

### Sample Requests

Request nonce:
```bash
curl -X POST http://localhost:5000/api/auth/nonce \
	-H 'Content-Type: application/json' \
	-d '{"walletAddress":"EQC1234abcd..."}'
```

Authenticate (after signing nonce message):
```bash
curl -X POST http://localhost:5000/api/auth \
	-H 'Content-Type: application/json' \
	-d '{"walletAddress":"EQC1234abcd...","signature":"base64-signature","nonce":"1739283812-xyz"}'
```
Response:
```json
{ "token": "<jwt>" }
```

Protected endpoint (profile):
```bash
curl -H "Authorization: Bearer <jwt>" http://localhost:5000/api/profile
```

Check-in:
```bash
curl -X POST -H "Authorization: Bearer <jwt>" http://localhost:5000/api/check-in
```

### Error Shape

Non-success responses share a consistent structure:
```json
{
	"success": false,
	"message": "Human readable summary",
	"details": []
}
```

### Swagger Docs

Swagger UI is mounted at `/docs` (root, not under `/api`). Definition generated from JSDoc annotations in `src/routes/*.js`.

## Environment Variable Reference

| Variable | Required | Default | Notes |
| -------- | -------- | ------- | ----- |
| `MONGO_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Strong random hex string |
| `REDIS_URL` | Yes | - | Redis hostname/IP |
| `REDIS_PORT` | Yes | 6379 | Redis port |
| `PORT` | No | 5000 | HTTP server port |
| `JWT_EXPIRY_HOURS` | No | 6 | JWT lifetime in hours |
| `JWT_EXPIRY_DAYS` | Legacy | - | Converted to hours if present |
| `CORS_ORIGIN` | No | http://localhost:5173 | Allowed origin for browser clients |
| `TON_NETWORK` | No | mainnet | TON network selection |
| `RATE_LIMIT_WINDOW_SECONDS` | No | 900 | Rate limit window length |
| `RATE_LIMIT_MAX_AUTH` | No | 20 | Auth attempts per window |
| `RATE_LIMIT_MAX_NONCE` | No | 30 | Nonce requests per window |
| `REDIS_USERNAME` | No | - | If Redis ACLs enabled |
| `REDIS_PASSWORD` | No | - | If Redis auth enabled |

## Troubleshooting

| Issue | Symptom | Fix |
| ----- | ------- | ---- |
| Missing env var | Startup aborts with assertion | Ensure `.env` contains required keys |
| Redis unreachable | Logs show connection errors | Verify `REDIS_URL`/`REDIS_PORT` or compose service name |
| Rate limit blocked | 429 + retryAfterSeconds | Wait specified seconds or adjust env vars |
| JWT expired | 401 on protected routes | Re-authenticate via nonce + auth flow |
| Docker build fails on lockfile | `pnpm-lock.yaml` not found | Remove it from `.dockerignore` |

## Security Considerations

- Use HTTPS in production (TLS termination at proxy / ingress).
- Rotate `JWT_SECRET` periodically; invalidate old tokens if required.
- Apply resource-level limits in MongoDB & Redis (memory alerts, backups).
- Consider adding structured logging & audit trails.

## Contributing

1. Fork / branch
2. Add feature with tests (to be added)
3. Open PR with description and endpoint updates if applicable

## Changelog

v1.0.1
- Added comprehensive README (setup, API usage, env reference)
- Optimized Dockerfile for production (install prod deps only, non-root user)
- Ensured lockfile retained for reproducible builds

## Swagger

Swagger docs appear if `src/swagger.js` is wired and route exposed (check implementation).

## Next Improvements (Optional)

- Add rate limiting middleware.
- Add structured logging (pino / winston).
- Add tests & CI pipeline.
