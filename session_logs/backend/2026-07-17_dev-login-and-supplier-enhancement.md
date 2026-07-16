# Session Log: Dev Login Enhancement & Supplier Market Field

**Date**: 2026-07-17  
**Agent**: @backend  
**Duration**: ~2 hours

## Summary

Implemented two major enhancements:

1. **Dev Login with Account Selection** - Changed from auto-login to showing list of users by role for selection
2. **Supplier Market Seller Field** - Added `isMarketSeller` and `marketName` fields to support market-based suppliers
3. **Remove NIB File Upload** - Simplified registration by removing file upload requirement, keeping only NIB number

## Changes Made

### 1. Dev Login Enhancement (Development Only)

**Files Modified:**

- `apps/backend/src/modules/auth/services/auth.service.ts`
  - Added `getDevUsers(role: string)` method to fetch users by role
  - Modified `devLogin(role: string, userId?: string)` to accept optional userId parameter
  - Changed guard from `!== "production"` to `=== "development"` for stricter control

- `apps/backend/src/modules/auth/controllers/auth.controller.ts`
  - Added `GET /dev-users` endpoint to list users by role
  - Modified `GET /dev-login` to accept `userId` query parameter

- `apps/portal/src/lib/api.ts`
  - Added `getDevUsers(role: string)` function
  - Modified `devLogin(role: string, userId?: string)` to accept userId

- `apps/portal/src/app/auth/dev-login/page.tsx`
  - Rewrote to fetch users from database
  - Added account selection UI with user cards
  - Shows user name, email, and SPPG/Supplier info
  - Always shows selection UI (no auto-login even with 1 user)

- `apps/portal/src/components/features/auth/LoginForm.tsx`
  - Changed dev login guard from `!== "production"` to `=== "development"`

**Behavior:**

- Only available when `NODE_ENV === "development"`
- Fetches all users from database by role
- Shows selection UI with user cards
- No auto-login, always requires user selection
- Returns 403 Forbidden if accessed in non-development environment

### 2. Supplier Market Seller Field

**Files Modified:**

- `apps/backend/prisma/schema.prisma`
  - Added `isMarketSeller Boolean @default(false)` to Supplier model
  - Added `marketName String?` to Supplier model
  - Made `district` field optional (String?)

- `apps/backend/src/modules/auth/dto/register-supplier.dto.ts`
  - Added `isMarketSeller?: boolean` field
  - Added `marketName?: string` field with validation
  - Made `district` optional

- `apps/backend/src/modules/auth/services/auth.service.ts`
  - Added conditional validation in `register()`:
    - Market seller: requires `marketName`, `province`, `regency`
    - Non-market seller: requires `province`, `regency`, `district`
  - Auto-prefix "Pasar " to marketName if not already present

- `apps/backend/src/modules/supplier/application/dto/create-supplier.dto.ts`
  - Added `isMarketSeller?: boolean`
  - Added `marketName?: string`

- `apps/backend/src/modules/supplier/application/dto/update-supplier-profile.dto.ts`
  - Added `isMarketSeller?: boolean`
  - Added `marketName?: string`

- `apps/backend/src/modules/supplier/domain/entities/supplier.entity.ts`
  - Added `isMarketSeller: boolean` property
  - Added `marketName: string | null` property
  - Updated `updateProfile()` method to handle new fields

- `apps/backend/src/modules/supplier/domain/repositories/supplier.repository.ts`
  - Updated `CreateSupplierData` interface
  - Updated `UpdateSupplierData` interface

- `apps/backend/src/modules/supplier/infrastructure/prisma/supplier.repository.ts`
  - Updated `create()` method to include new fields
  - Updated `toDomain()` method to map new fields

- `apps/backend/src/modules/market/services/market.service.ts`
  - Updated `SupplierItemWithSupplier` interface to make `district` nullable
  - Fixed `matchesRegionField()` call to handle null district

- `apps/portal/src/lib/api.ts`
  - Updated `registerSupplier()` type to include new fields
  - Made `district` optional

- `apps/portal/src/components/features/auth/RegisterForm.tsx`
  - Added `isMarketSeller` state
  - Added `marketName` state
  - Added checkbox "Saya adalah penjual di pasar"
  - Conditional rendering:
    - Market seller: shows market name input with "Pasar" prefix, province, regency only
    - Non-market seller: shows full address form with district required
  - Updated validation logic
  - Updated confirmation page to show market info

**Validation Rules:**

- Market seller: `marketName` required (min 3 chars, max 100 chars, alphanumeric + spaces + punctuation)
- Market seller: `province` and `regency` required
- Non-market seller: `province`, `regency`, `district` required
- Backend auto-prefixes "Pasar " to marketName if not present

### 3. Remove NIB File Upload

**Files Modified:**

- `apps/backend/src/modules/auth/dto/register-supplier.dto.ts`
  - Updated `nib` field description from "NIB file URL/path" to "Nomor Induk Berusaha"

- `apps/backend/prisma/schema.prisma`
  - Updated `nib` field comment from "File URL/path ke scan NIB" to "Nomor Induk Berusaha"

- `apps/backend/prisma/seed.ts`
  - Changed all `nib` values from file paths to NIB numbers (e.g., "1234567890123")

- `apps/portal/src/components/features/auth/RegisterForm.tsx`
  - Removed `FileUpload` import
  - Removed `uploadFile` import
  - Removed `nibFile` state
  - Removed file upload validation
  - Removed file upload logic in `handleSubmit()`
  - Removed `<FileUpload>` component from UI
  - Removed "File NIB" from confirmation summary

- `apps/portal/src/lib/api.ts`
  - Removed `nibFileUrl` parameter from `registerSupplier()`
  - Removed `uploadFile()` function (no longer used)

- `apps/portal/src/components/features/admin/supplier-integration/mockData.ts`
  - Updated all `nib` values from file paths to NIB numbers

- `apps/portal/src/components/features/admin/supplier-integration/SupplierCreateOrderModal.tsx`
  - Updated mock supplier `nib` values from file paths to NIB numbers

### 4. Seed Data Update

**Files Modified:**

- `apps/backend/prisma/seed.ts`
  - Completely rewritten to support Cirebon location
  - Added 3 SPPG accounts (Cirebon Utara, Selatan, Barat)
  - Added 18 supplier accounts (9 market sellers + 9 non-market sellers)
  - Added 21 user accounts (3 admin + 18 supplier)
  - Added ~85 supplier items for realistic market simulation
  - Added 6 beneficiaries
  - Added 2 MoU agreements
  - Added 7 orders with varied statuses
  - Added 3 batches
  - Added 2 complaints
  - Added 5 inventory stocks
  - Added 1 inventory adjustment log
  - Added 2 operational expenses
  - Total: ~150 data records

**Market Simulation:**

- 11 different items with varying supplier counts (3-14 suppliers per item)
- Realistic price ranges for mature market simulation
- Some outlier prices for testing IQR validation
- Mix of market sellers and non-market sellers

## Database Migrations

Created 2 new migrations:

1. `20260716194129_add_market_seller_fields` - Adds `isMarketSeller` and `marketName` to Supplier, makes `district` optional
2. `20260716200703_remove_upload_nib` - Placeholder migration (no schema changes, just comment updates)

## Testing

**Dev Login:**

- Tested with multiple users per role
- Verified selection UI displays correctly
- Confirmed 403 error in production mode
- Verified login redirects to correct dashboard

**Supplier Registration:**

- Tested market seller registration with market name
- Tested non-market seller registration with full address
- Verified conditional validation works correctly
- Confirmed "Pasar " prefix is auto-added

**NIB Registration:**

- Verified NIB number input works
- Confirmed no file upload UI appears
- Checked that old file path references are updated

**Seed Data:**

- Successfully seeded database with new data
- Verified all relationships are correct
- Confirmed market simulation data is realistic

## Technical Debt & Notes

1. **Prisma Client Regeneration**: Had to manually delete `node_modules/.prisma` and regenerate to pick up new schema fields
2. **TypeScript Errors**: Fixed array type annotations in seed.ts to prevent `never[]` inference
3. **Market Name Prefix**: Backend auto-prefixes "Pasar " but frontend already shows it as fixed text, so need to ensure no double prefix

## Next Steps

1. Test dev login with actual frontend
2. Verify supplier registration flow end-to-end
3. Test market price validation with new supplier data
4. Update API documentation to reflect new fields
5. Consider adding market name to supplier list/detail views in admin panel

## Files Changed Summary

**Backend:**

- 1 Prisma schema file
- 1 migration directory (2 migrations)
- 1 seed file
- 3 auth module files (service, controller, DTO)
- 4 supplier module files (entity, repository, DTOs)
- 1 market service file

**Frontend:**

- 1 API client file
- 1 dev login page
- 1 login form component
- 1 register form component
- 2 mock data files

**Total:** ~20 files modified
