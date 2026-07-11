# Session Log - @backend + @frontend - 2026-07-11

## Current Task

Mock SSO + Email/Password Auth (Gabungan A + B)

## Progress

- [x] Create TopProgressBar component
- [x] Add TopProgressBar to providers
- [x] Backend dev-login endpoint
- [x] Update API client (api.ts)
- [x] Add admin auth guard
- [x] Update RegisterForm (npwp → nib)
- [x] Create SSO redirect page
- [x] Update LoginForm (SSO button + dev links)
- [x] Verify compilation (0 errors both backend + frontend)
- [x] Rebuild shared dist
- [x] Commit + push

## Files Created

- `apps/portal/src/components/ui/TopProgressBar.tsx` — animated loading line at top of page
- `apps/portal/src/app/auth/sso-redirect/page.tsx` — BGN portal mock page with logo + user info + authorize
- `apps/portal/src/app/auth/dev-login/page.tsx` — frontend dev-login that calls backend

## Files Modified

- `apps/backend/src/modules/auth/controllers/auth.controller.ts` — added GET /auth/dev-login
- `apps/backend/src/modules/auth/services/auth.service.ts` — added devLogin() method
- `apps/portal/src/app/providers.tsx` — added TopProgressBar
- `apps/portal/src/app/admin/layout.tsx` — converted to client component with auth guard
- `apps/portal/src/components/features/auth/LoginForm.tsx` — SSO BGN button + dev login links
- `apps/portal/src/components/features/auth/RegisterForm.tsx` — npwp → nib field
- `apps/portal/src/lib/api.ts` — registerSupplier sends nib, added devLogin + handleSsoCallback

## Auth Flow Summary

1. **Email/Password**: POST /auth/login → JWT → redirect by role
2. **SSO Mock**: POST /auth/sso → /auth/sso-redirect → GET /auth/callback → JWT → redirect
3. **Dev Login**: GET /auth/dev-login?role=SPPG_ADMIN → JWT → redirect (dev only)

## Git Commits

- `38d90e9` — [frontend][backend] add mock SSO + email/password auth + admin guard

## Checkpoint

- Context usage: ~50%
- TypeScript compilation: 0 errors (backend + frontend)
- Shared dist: rebuilt clean
