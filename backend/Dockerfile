# Backend Dockerfile
# Multi-stage for smaller production image

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
# Enable corepack for pnpm
RUN corepack enable

FROM base AS deps
# Copy only manifest files for faster caching (include lockfile for reproducibility)
COPY package.json pnpm-lock.yaml ./
# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

FROM base AS prod
# Copy installed prod deps from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
# Copy source (only JS and necessary files for runtime)
COPY src ./src
COPY .env.example ./
# Use non-root user provided by node image for security
USER node
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
