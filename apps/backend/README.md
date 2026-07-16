# SIGIZI - Backend Application

NestJS API for SIGIZI platform.

## Setup

```bash
# Install dependencies
pnpm install

# Setup database
cp ../../.env.example ../../.env
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed

# Start development
pnpm dev
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm prisma:seed` - Seed database

## API Documentation

Once running, visit: `http://localhost:3001/docs`
