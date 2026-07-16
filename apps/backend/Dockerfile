FROM node:18-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Backend stage
FROM base AS backend-deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS backend
WORKDIR /app
COPY --from=backend-deps /app/node_modules ./node_modules
COPY --from=backend-deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=backend-deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
RUN cd apps/backend && pnpm prisma generate
RUN cd apps/backend && pnpm build

WORKDIR /app/apps/backend
CMD ["node", "dist/main"]
