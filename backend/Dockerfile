# Backend Dockerfile
# Multi-stage for smaller production image

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
# Enable corepack for pnpm
RUN corepack enable

FROM base AS deps
# Copy only manifest files for faster caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS prod
# Copy installed deps from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
# Copy source
COPY src ./src
# Copy env example (not real secrets)
COPY .env.example ./
EXPOSE 5000
CMD ["node", "src/server.js"]

# Development variant (optional)
FROM base AS dev
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY src ./src
COPY .env.example ./
EXPOSE 5000
CMD ["node", "src/server.js"]
