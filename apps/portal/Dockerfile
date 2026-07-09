FROM node:18-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Portal stage
FROM base AS portal-deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/portal/package.json ./apps/portal/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM base AS portal
WORKDIR /app
COPY --from=portal-deps /app/node_modules ./node_modules
COPY --from=portal-deps /app/apps/portal/node_modules ./apps/portal/node_modules
COPY --from=portal-deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY apps/portal ./apps/portal
COPY packages/shared ./packages/shared
RUN cd apps/portal && pnpm build

WORKDIR /app/apps/portal
CMD ["pnpm", "start"]
