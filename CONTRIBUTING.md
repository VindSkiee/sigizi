# Contributing to SIGIZI

## Commit Message Convention

Gunakan prefix berikut di commit message untuk memudahkan filtering di GitHub:

```
[backend] Deskripsi commit
[frontend] Deskripsi commit
[shared] Deskripsi commit
[config] Deskripsi commit
[docs] Deskripsi commit
[all] Deskripsi commit
```

### Contoh

```bash
# Backend changes
git commit -m "[backend] add supplier CRUD endpoint"
git commit -m "[backend] implement dynamic median algorithm"
git commit -m "[backend] fix batch number generation"

# Frontend changes
git commit -m "[frontend] create batch tracking page"
git commit -m "[frontend] add responsive navbar"

# Shared package changes
git commit -m "[shared] update TypeScript types for Batch"

# Config/infra changes
git commit -m "[config] setup docker-compose for local dev"
git commit -m "[config] add GitHub Actions workflow"

# Documentation
git commit -m "[docs] update API documentation"

# Multi-area changes
git commit -m "[all] initial project setup"
```

## Branch Naming

Gunakan format branch名称:

```
feat/backend-add-supplier-api
feat/frontend-batch-tracking
fix/backend-batch-number
chore/config-setup-ci
docs/update-api
```

## Pull Request Guidelines

### 1. PR Title Format

```
[backend] Add supplier CRUD endpoint
[frontend] Create batch tracking page
[shared] Update TypeScript types
[config] Setup CI/CD pipeline
```

### 2. PR Description

```markdown
## What
Brief description of changes

## Why
Reason for the change

## How
Implementation details (if complex)

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] No breaking changes

## Screenshots (if UI changes)
```

### 3. Review Process

- **Backend PR**: Requires review from `@tracebite/backend-team`
- **Frontend PR**: Requires review from `@tracebite/frontend-team`
- **Shared/Config PR**: Requires review from both teams

## Development Workflow

### 1. Clone & Setup

```bash
git clone https://github.com/tracebite/sigizi.git
cd sigizi
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 2. Create Feature Branch

```bash
# From main branch
git checkout -b feat/backend-add-supplier

# Or from develop branch
git checkout develop
git checkout -b feat/frontend-batch-page
```

### 3. Make Changes

```bash
# Work on your area
cd apps/backend  # or apps/portal

# Make changes...
pnpm dev  # Test locally
```

### 4. Commit & Push

```bash
# Stage changes
git add .

# Commit with proper prefix
git commit -m "[backend] add supplier CRUD endpoint"

# Push to remote
git push origin feat/backend-add-supplier
```

### 5. Create PR

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in PR title with proper prefix
5. Fill in PR description
6. Add labels (auto-labeled by GitHub Actions)
7. Request review from appropriate team

## Code Quality

### Backend

```bash
cd apps/backend
pnpm lint          # Check linting
pnpm build         # Build for production
pnpm prisma:generate  # Generate Prisma client
```

### Frontend

```bash
cd apps/portal
pnpm lint          # Check linting
pnpm build         # Build for production
```

## File Structure Ownership

| Path | Team | Review Required |
|------|------|-----------------|
| `apps/backend/**` | Backend | `@tracebite/backend-team` |
| `apps/portal/**` | Frontend | `@tracebite/frontend-team` |
| `packages/**` | Both | Both teams |
| `docs/**` | Lead | `@tracebite/lead` |
| Root configs | Lead | `@tracebite/lead` |

## Labels

GitHub Actions will auto-label your PR based on changed files:

- `backend` - Changes in `apps/backend/`
- `frontend` - Changes in `apps/portal/`
- `shared` - Changes in `packages/`
- `docs` - Changes in `docs/` or `*.md`
- `config` - Changes in config files
- `database` - Changes in Prisma schema

## Questions?

Contact the team lead or open a discussion in GitHub.
