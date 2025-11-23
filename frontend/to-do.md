## Project Implementation Checklist

### Backend
- [x] Define project scope (wallet auth, streak, leaderboard, profile, docs)
- [x] Set environment configs (`.env` + `.env.example`)
- [x] Model user schema (walletAddress, nonce, heroPoints, dailyStreak, lastCheckIn, nextEligibleCheckIn, timestamps)
- [x] Implement nonce endpoint (POST `/auth/nonce`)
- [x] Implement auth endpoint (POST `/auth`) signature + nonce verification
- [x] Add auth middleware (JWT verify, attach user)
- [x] Implement profile fetch (GET `/profile`)
- [x] Implement check-in logic (POST `/check-in` streak rules)
- [x] Implement leaderboard (GET `/leaderboard` top 10 heroPoints)
- [x] Configure Swagger docs (correct glob, bearerAuth security, server URL)
- [x] reduce jwt token life to 6hours
- [x] Add error handling layer (central handler + Joi validation)
- [ ] Add integration tests (auth, check-in, leaderboard)
- [x] Implement rate limiting (optional for auth endpoints)
- [ ] Add caching layer (Redis leaderboard TTL)
- [ ] Security review (JWT expiry, CORS, data exposure)
- [ ] Performance review (indexes, query optimization)
- [ ] Documentation updates (README setup, API usage)
- [x] Deployment prep (Dockerfile, compose/CI, health checks)

### Frontend
- [x] Frontend project setup (routing, optional React Query, UI lib)
- [x] Design global layout (navigation, header, responsive)
- [x] Integrated Ton Connect Wallet
- [x] Implement routing map (`/login`, `/dashboard`, `/profile`, `/leaderboard`)
- [x] Create API client (base URL, auth header, 401 handling)
- [x] Build login flow (nonce request, wallet sign, auth, store JWT)
- [x] State management auth (context + localStorage persistence)
- [x] Profile/data Provider
- [ ] Check-in interaction (button + optimistic/stale refetch)
- [ ] UI components (buttons, cards, stats, table, toasts)
- [ ] Handle errors (unified parser, user-friendly messages)
- [ ] Loading skeletons (profile & leaderboard)
- [ ] Implement logout flow (clear token, redirect)
- [ ] Protected route wrapper (redirect unauthenticated)
- [ ] Optional: /docs link (embed Swagger or external)

### Cross-Cutting
- [x] Environment variable alignment (frontend `VITE_API_BASE`, backend server URL)
- [ ] Complete verification flow
- [ ] Consistent response shapes (status, message, data)
- [ ] Monitoring/logging improvements (optional)
- [ ] Final QA pass (flows: login -> dashboard -> check-in -> leaderboard)

### Nice-to-Haves (Later)
- [ ] Dark mode / theming
- [ ] Pagination or extended leaderboard
- [ ] Refresh token / session extension
- [ ] Analytics (basic usage metrics)

> Update items by replacing `[ ]` with `[x]` as completed.
