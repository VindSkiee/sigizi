# SIGIZI

Platform GovTech untuk digitalisasi perizinan dan pengawasan vendor program Makan Bergizi Gratis (MBG).

## Tech Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js (CSR + SSR untuk portal publik) + Tailwind CSS
- **Monorepo**: pnpm workspace + Turborepo

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- PostgreSQL (atau gunakan Docker)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Database

```bash
# Copy env file
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

### 3. Start Development

```bash
# Start all services
pnpm dev

# Atau start per-service
pnpm dev:backend    # http://localhost:3001
pnpm dev:portal     # http://localhost:3000
```

### 4. Using Docker

```bash
docker-compose up -d
```

## Project Structure

```
sigizi/
├── apps/
│   ├── backend/           # NestJS API
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # SSO BGN login
│   │   │   │   ├── supplier/   # CRUD supplier
│   │   │   │   ├── batch/      # QR traceability
│   │   │   │   ├── complaint/  # Keluhan
│   │   │   │   ├── reports/    # Auto-generate laporan
│   │   │   │   └── market/     # Dynamic Median
│   │   │   └── database/
│   │   └── prisma/
│   │
│   └── portal/            # Next.js Portal Publik
│       └── src/
│           ├── app/
│           │   ├── page.tsx        # Home (CSR)
│           │   └── batch/page.tsx  # Cek Resi (SSR)
│           └── lib/
│
├── packages/
│   └── shared/            # Shared types & constants
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
└── docker-compose.yml
```

## API Documentation

Backend API docs available at: `http://localhost:3001/docs`

### Key Endpoints

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/api/auth/sso`             | Login via SSO BGN      |
| GET    | `/api/public/batch/:number` | Public: Cek resi batch |
| POST   | `/api/batches`              | Create batch           |
| POST   | `/api/complaints`           | Submit complaint       |
| GET    | `/api/market/prices`        | Get market prices      |
| GET    | `/api/reports/daily`        | Get daily report       |

## Development Workflow

### Backend Team

```bash
cd apps/backend
pnpm prisma:migrate    # Create migration
pnpm prisma:studio     # View database
pnpm build             # Build for production
```

### Frontend Team

```bash
cd apps/portal
pnpm dev               # Start dev server
pnpm build             # Build for production
```

## Environment Variables

**Single `.env` file at project root** — used by both backend and frontend.

```bash
# From project root
cp .env.example .env
# Edit .env with your settings
```

The backend loads `.env` from root via `envFilePath: "../../.env"` in `ConfigModule`.
Frontend uses `NEXT_PUBLIC_*` variables from the same root `.env`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commit message convention and PR guidelines.

### Commit Convention

```
[backend] Add supplier CRUD endpoint
[frontend] Create batch tracking page
[shared] Update TypeScript types
[config] Setup CI/CD pipeline
```

### Auto Labeling

GitHub Actions will auto-label PRs based on changed files:

- `backend` - Changes in `apps/backend/`
- `frontend` - Changes in `apps/portal/`
- `shared` - Changes in `packages/`

## License

Proprietary - TraceBite
