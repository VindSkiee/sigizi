# Session Log - @backend - 2026-07-11

## Current Task

Supplier registration + email/password login via auth module

## Progress

- [x] Install bcrypt + @types/bcrypt
- [x] Update packages/shared/src/index.ts with RegisterSupplierRequest, LoginRequest, password constants
- [x] Create auth/dto/register-supplier.dto.ts
- [x] Create auth/dto/login.dto.ts
- [x] Update auth.service.ts with register() + login()
- [x] Update auth.controller.ts with register + login endpoints
- [x] Update seed.ts with password hashes
- [x] Rebuild shared dist
- [x] pnpm install + prisma generate
- [x] Commit + push

## Files Modified

- `apps/backend/package.json` — added bcrypt + @types/bcrypt
- `apps/backend/prisma/seed.ts` — added hashSync for all seed users
- `apps/backend/src/modules/auth/controllers/auth.controller.ts` — POST /auth/register, POST /auth/login
- `apps/backend/src/modules/auth/dto/login.dto.ts` — NEW
- `apps/backend/src/modules/auth/dto/register-supplier.dto.ts` — NEW
- `apps/backend/src/modules/auth/services/auth.service.ts` — register() + login() with bcrypt
- `apps/backend/src/modules/supplier/dto/create-supplier.dto.ts` — unchanged (admin CRUD only)
- `packages/shared/src/index.ts` — RegisterSupplierRequest, LoginRequest, LoginEmailRequest, password constants, validation messages

## Decisions Made

- Supplier registration lives in Auth module (Option A) — Auth owns identity, Supplier owns business logic
- RegisterSupplierDto combines auth fields (email, password) + supplier fields
- LoginDto: email + password → JWT
- bcrypt 10 rounds for password hashing
- Seed password: "password123" for all users
- CreateSupplierDto stays unchanged — it's for admin CRUD, not registration

## Blockers

- Git push from WSL fails (no GitHub credentials in WSL). Fixed by using `cmd.exe` to push from Windows side.
- Docker Desktop was not running. User ran `pnpm db:fresh` successfully.

## Next Steps

1. Test register + login endpoints via curl/Postman
2. Verify seed data has passwords (all users can login with password123)
3. Frontend: Login page should call POST /auth/login
4. Frontend: Supplier registration form should call POST /auth/register

## Git Commits

- `0c43e45` — [backend] implement all 10 DDD modules + fix Node.js 24 ESM resolution
- `c28a3a8` — [backend] add supplier registration + email/password login

## Checkpoint

- Context usage: ~40%
- TypeScript compilation: 0 errors
- Shared dist: rebuilt clean
