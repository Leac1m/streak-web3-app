# Streak Frontend

Modern React Router + Vite application for the Streak platform. Provides wallet authentication, streak management, leaderboard browsing, and profile insights.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Tech Stack
- React Router App Router
- Vite + pnpm
- Tailwind CSS via `@tailwindcss/postcss`
- @mysten/dapp-kit for Sui wallet integrations

## Quick Start
```bash
cd frontend
pnpm install
pnpm dev
```
The dev server runs at `http://localhost:5173` and targets `http://localhost:5000/api` by default. Update `VITE_API_BASE` if your backend lives elsewhere.

```bash
pnpm install
```

## Environment Variables
Copy `.env.example` to `.env` and tweak as required.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE` | `http://localhost:5000/api` | Backend REST base URL |
| `VITE_ENABLE_MOCKS` | `true` | Toggle for future mock data hooks |

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

Additional optional variables (`VITE_APP_NAME`, `VITE_TON_NETWORK`, `VITE_LOG_LEVEL`) are parsed in `src/config/env.ts` but not mandatory.

## Scripts
| Command | Description |
| --- | --- |
| `pnpm dev` | Launch the Vite dev server with HMR |
| `pnpm build` | Produce a production build in `build/` |
| `pnpm preview` | Preview the production output locally |

```bash
npm run build
```

## Docker
The included `Dockerfile` installs dependencies with pnpm, builds the static assets, and serves them via `npx serve`.

```bash
cd frontend
docker build -t streak-frontend .
docker run -p 5173:5173 streak-frontend
```

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

## UI Map
- **Home** – Hero, feature highlights, and quick links to dashboard & leaderboard.
- **Login** – Wallet connection, nonce signing, and JWT issuance.
- **Dashboard** – Live streak metrics, eligibility timer, and check-in action.
- **Leaderboard** – Top hero point wallets from the backend API.
- **Profile** – Wallet summary, streak timing, and session hints.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling Notes
- Tailwind utilities power the layout. Global theming lives in `app/app.css`.
- Gradient classes use the Tailwind v4 `bg-linear-to-*` aliases.
- Panels lean on “frosted glass” aesthetics to match the premium streak branding.

## Tips for Development
- Keep the backend running (see `backend/README.md`) so auth and leaderboard calls succeed.
- JWT tokens persist in `localStorage`; use the navbar logout button to clear them.
- Update `src/config/env.ts` if you introduce new Vite env values.

---

Built with ❤️ using React Router.
