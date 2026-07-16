# Universal Agent Setup

**IMPORTANT**: Agent must read this file before starting any work.

---

## Overview

This document provides setup instructions for all agent tools working on SIGIZI.

---

## Quick Start

### 1. Verify Environment

```bash
# Check Node.js version (requires >= 18)
node --version

# Check pnpm version (requires >= 9)
pnpm --version

# Check git
git --version
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install
```

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings
# Minimum required:
# - DATABASE_URL
# - JWT_SECRET
# - GITHUB_TOKEN (for GitHub MCP)
```

### 4. Start Database

```bash
# Start PostgreSQL using Docker
docker-compose up db -d

# Wait for database to be ready
sleep 5

# Verify database is running
docker-compose ps
```

### 5. Run Migrations

```bash
# Navigate to backend
cd apps/backend

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database (optional)
pnpm prisma:seed

# Return to root
cd ../..
```

### 6. Start Development

```bash
# Start all servers
docker-compose up

# Or start individually
# Terminal 1: Backend
cd apps/backend && pnpm dev

# Terminal 2: Frontend
cd apps/portal && pnpm dev
```

---

## Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sigizi"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# GitHub (for GitHub MCP)
GITHUB_TOKEN="your_github_token"

# API
API_PORT=3001
API_PREFIX="api"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

---

## MCP Servers

### Required MCP Servers

| MCP Server | Purpose | Install |
|------------|---------|---------|
| Git | Version control | `npm i -g @modelcontextprotocol/server-git` |
| GitHub | Repository API | `npm i -g @modelcontextprotocol/server-github` |
| Filesystem | File operations | `npm i -g @modelcontextprotocol/server-filesystem` |
| PostgreSQL | Database queries | `npm i -g @modelcontextprotocol/server-postgres` |
| Context7 | Documentation | Remote (no install) |
| Memory | Project context | `npm i -g @modelcontextprotocol/server-memory` |

### Install All MCPs

```bash
npm install -g \
  @modelcontextprotocol/server-git \
  @modelcontextprotocol/server-github \
  @modelcontextprotocol/server-filesystem \
  @modelcontextprotocol/server-postgres \
  @modelcontextprotocol/server-memory \
  @modelcontextprotocol/server-sequential-thinking
```

---

## Agent Tools Setup

### OpenCode

```bash
# Install OpenCode
curl -fsSL https://opencode.ai/install | bash

# Start OpenCode in project root
cd /path/to/sigizi
opencode

# Select agent: Tab key to switch between backend/frontend
```

### Other Tools

For Cursor, Claude Desktop, or other tools, reference:
- `AGENTS.md` - Main agent configuration
- `docs/backend/GUIDE.md` - Backend guide
- `docs/frontend/GUIDE.md` - Frontend guide

---

## Phase Awareness

**Always check `docs/PROJECT_STATUS.md` before starting work.**

### Current Phase: MVP (Phase 1)

Progress: ~35-40%

### MVP Must-Haves

- [ ] pnpm install
- [ ] .env configuration
- [ ] Prisma migration
- [ ] Order module CRUD
- [ ] SPPG module CRUD
- [ ] Beneficiary module CRUD
- [ ] Login page
- [ ] Auth context/provider
- [ ] Dashboard layout
- [ ] Supplier management page
- [ ] Batch management page
- [ ] Complaint management page
- [ ] Market/Analytics page
- [ ] Reports page

---

## Skills

Skills are located in:
- `docs/backend/skills/` - Backend skills
- `docs/frontend/skills/` - Frontend skills

### Using Skills

1. Identify the task you're working on
2. Check if a relevant skill exists
3. Read the SKILL.md file for that skill
4. Apply the patterns and conventions

### Backend Skills

| Skill | Use When |
|-------|----------|
| nestjs-module-scaffold | Creating new module |
| ddd-boundary-rules | Module interactions |
| prisma-conventions | Database changes |
| repository-pattern | Data access |
| controller-pattern | API endpoints |
| mapper-pattern | Data transformation |
| validation-pattern | Input validation |
| transaction-pattern | DB transactions |
| exception-pattern | Error handling |
| testing-pattern | Unit/E2E tests |

### Frontend Skills

| Skill | Use When |
|-------|----------|
| nextjs-ssr-csr-boundary | SSR vs CSR decision |
| nextjs-page-pattern | Creating new page |
| react-component-pattern | Creating component |
| tailwind-styling-pattern | Styling components |
| api-integration-pattern | API calls |
| form-pattern | Form handling |
| state-management-pattern | State management |
| error-handling-pattern | Error UI |
| loading-pattern | Loading states |
| testing-pattern | Component tests |

---

## Commit Convention

```bash
# Format
[prefix] Deskripsi perubahan

# Examples
[backend] add supplier CRUD endpoint
[frontend] create batch tracking page
[shared] update TypeScript types for Batch
[config] setup docker-compose
[docs] update API documentation
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart db

# Check logs
docker-compose logs db
```

### Migration Issues

```bash
# Reset database
cd apps/backend
pnpm prisma migrate reset

# Re-run migrations
pnpm prisma:migrate

# Re-seed
pnpm prisma:seed
```

### Build Issues

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

---

## Important Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Main agent configuration |
| `opencode.json` | OpenCode configuration |
| `docs/PROJECT_STATUS.md` | Current project status |
| `docs/backend/GUIDE.md` | Backend development guide |
| `docs/frontend/GUIDE.md` | Frontend development guide |
| `docs/backend/MCP.md` | Backend MCP configuration |
| `docs/frontend/MCP.md` | Frontend MCP configuration |

---

*This file must be read by agents before starting any work.*
