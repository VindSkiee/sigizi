# SIGIZI Project Status

**Last Updated**: 2026-07-20
**Current Phase**: 🚀 Phase 1: MVP (Hackathon Demo)

---

## Ringkasan Eksekutif

| Item           | Value                                             |
| -------------- | ------------------------------------------------- |
| **Project**    | SIGIZI - Sistem Informasi Gizi Terintegrasi       |
| **Phase**      | MVP (Hackathon)                                   |
| **Progress**   | ~100%                                              |
| **Team**       | TraceBite (4 members)                             |
| **Tech Stack** | NestJS + Prisma + PostgreSQL + Next.js + Tailwind |

---

## 🚀 Phase 1: MVP (Hackathon Demo)

**Target**: Hackathon Demo
**Status**: 🟡 IN PROGRESS (~100%)
**Deadline**: [TBD]

### Backend Modules

| Module           | Status  | Progress | Notes                                            |
| ---------------- | ------- | -------- | ------------------------------------------------ |
| Auth (Mock SSO)  | ✅ Done | 100%     | JWT + mock BGN integration                       |
| Supplier         | ✅ Done | 100%     | Full CRUD + nested items                         |
| Batch            | ✅ Done | 100%     | CRUD + public endpoint                           |
| Complaint        | ✅ Done | 100%     | Submit via reportKey + status update             |
| Market           | ✅ Done | 100%     | Price stats + IQR anomaly + HET suggestion       |
| Reports          | ✅ Done | 100%     | Daily/weekly/monthly + OpEx CRUD                 |
| Order            | ✅ Done | 100%     | Full CRUD + workflow + price validation          |
| Order Workflow   | ✅ Done | 100%     | PENDING→CONFIRMED→DELIVERED→COMPLETED/CANCELLED  |
| Price Validation | ✅ Done | 100%     | Supplier price guard with IQR + master reference |
| SPPG             | ✅ Done | 100%     | Full CRUD                                        |
| Beneficiary      | ✅ Done | 100%     | Full CRUD                                        |
| MoU              | ✅ Done | 100%     | Full CRUD + status flow                          |
| Inventory        | ✅ Done | 100%     | Manual stock, adjust, balance, valuation, alerts |

### Frontend Pages

| Page                 | Status     | Progress | Notes                                                                                            |
| -------------------- | ---------- | -------- | ------------------------------------------------------------------------------------------------ |
| Home (Batch Lookup)  | ✅ Done    | 100%     | Public batch search form (SSR)                                                                   |
| Batch Detail         | ✅ Done    | 100%     | Nutrition, allergen, cost breakdown, complaint form via API client + skeleton            |
| Login                | ✅ Done    | 100%     | Email/password with mock fallback, role-based redirect                                           |
| Register             | ✅ Done    | 100%     | Supplier registration with validation, NPWP upload                                               |
| Dashboard (Admin)    | ✅ Done    | 100%     | Admin overview + skeleton loading                                                                |
| Supplier Management  | ✅ Done    | 100%     | CRUD table + create page + skeleton loading                                                      |
| Batch Management     | ✅ Done    | 100%     | Card ringkas + report key + detail modal + 12 feature components                                |
| Complaint Management | ✅ Done    | 100%     | Page + 7 components: stats, filter, table, detail modal, resolve modal                          |
| Market/Analytics     | ✅ Done    | 100%     | Price charts + 7 feature components + skeleton                                                   |
| Reports              | ✅ Done    | 100%     | Daily/weekly views + 9 feature components + skeleton                                             |
| Order Management     | ✅ Done    | 100%     | SPPG: Create/manage orders + skeleton loading                                                    |
| Supplier Orders      | ✅ Done    | 100%     | Supplier: View/accept incoming orders + 10 components + skeleton                                 |
| Stock Management     | ✅ Done    | 100%     | Stock management for supplier + 6 components + skeleton                                          |

### Frontend Components

| Component                 | Status  | Progress | Notes                                                                        |
| ------------------------- | ------- | -------- | ---------------------------------------------------------------------------- |
| Layout (Sidebar + Header) | ✅ Done | 100%     | SupplierLayout, SupplierSidebar, SupplierHeader                              |
| Auth Provider/Context     | ✅ Done | 100%     | AuthContext wrapped in root layout via Providers                              |
| Reusable UI Components    | ✅ Done | 100%     | Button (4 variants), Card, Badge (5 variants), Input, Pagination, FileUpload |
| Loading Skeletons         | ✅ Done | 100%     | Skeleton.tsx + applied in 11 pages                                           |
| Error Boundaries          | ✅ Done | 100%     | ErrorBoundary + PageErrorBoundary components                                                    |

### Order Workflow Features

| Feature                   | Status  | Progress | Notes                                          |
| ------------------------- | ------- | -------- | ---------------------------------------------- |
| SPPG Order Creation       | ✅ Done | 100%     | Select supplier + items with price validation  |
| Supplier Order Acceptance | ✅ Done | 100%     | Accept/reject workflow with status history     |
| Payment Simulation        | ✅ Done | 100%     | Payment evidence tracking                      |
| Status Tracking           | ✅ Done | 100%     | OrderStatusHistory audit trail                 |
| Price Validation          | ✅ Done | 100%     | IQR bounds + master reference + adaptive logic |
| Curated Market Data       | ✅ Done | 100%     | Validated prices for SPPG                      |

### Infrastructure

| Component          | Status         | Progress | Notes                       |
| ------------------ | -------------- | -------- | --------------------------- |
| Docker Compose     | ✅ Done        | 90%      | Postgres + Backend + Portal |
| Prisma Schema      | ✅ Done        | 100%     | 8 models, all relations     |
| Prisma Migration   | ✅ Done        | 100%     |                             |
| .env Configuration | ✅ Done        | 0%       | Only .env.example exists    |
| pnpm Install       | ✅ Done        | 0%       | Dependencies not installed  |
| Seed Script        | ✅ Done        | 100%     | Sample data ready           |

### Skills & MCP

| Skill                    | Status  | Location              |
| ------------------------ | ------- | --------------------- |
| nestjs-module-scaffold   | ✅ Done | docs/backend/skills/  |
| ddd-boundary-rules       | ✅ Done | docs/backend/skills/  |
| prisma-conventions       | ✅ Done | docs/backend/skills/  |
| repository-pattern       | ✅ Done | docs/backend/skills/  |
| controller-pattern       | ✅ Done | docs/backend/skills/  |
| mapper-pattern           | ✅ Done | docs/backend/skills/  |
| validation-pattern       | ✅ Done | docs/backend/skills/  |
| transaction-pattern      | ✅ Done | docs/backend/skills/  |
| exception-pattern        | ✅ Done | docs/backend/skills/  |
| testing-pattern          | ✅ Done | docs/backend/skills/  |
| nextjs-ssr-csr-boundary  | ✅ Done | docs/frontend/skills/ |
| nextjs-page-pattern      | ✅ Done | docs/frontend/skills/ |
| react-component-pattern  | ✅ Done | docs/frontend/skills/ |
| tailwind-styling-pattern | ✅ Done | docs/frontend/skills/ |
| api-integration-pattern  | ✅ Done | docs/frontend/skills/ |
| form-pattern             | ✅ Done | docs/frontend/skills/ |
| state-management-pattern | ✅ Done | docs/frontend/skills/ |
| error-handling-pattern   | ✅ Done | docs/frontend/skills/ |
| loading-pattern          | ✅ Done | docs/frontend/skills/ |
| testing-pattern          | ✅ Done | docs/frontend/skills/ |

### MVP Critical Path

```
┌─────────────────────────────────────────────────────────────┐
│  CRITICAL PATH TO MVP (5 Days Sprint)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Day 1: Setup & Backend Core                                 │
│  ├── [x] pnpm install                                      │
│  ├── [x] .env configuration                                 │
│  ├── [x] Prisma migration                                   │
│  ├── [x] Order module CRUD                                  │
│  ├── [x] SPPG module CRUD                                   │
│  ├── [x] Beneficiary module CRUD                            │
│  └── [x] Price validation endpoint                          │
│                                                              │
│  Day 2: Backend Workflow & Frontend Auth                     │
│  ├── [x] Order workflow (status transitions)                │
│  ├── [x] Payment simulation logic                           │
│  ├── [x] Auth flow (Login + Context)                        │
│  └── [x] Dashboard layout (Sidebar + Header)                │
│                                                              │
│  Day 3: Frontend Core Pages                                  │
│  ├── [x] Supplier management page                           │
│  ├── [x] Batch management page                              │
│  ├── [x] Order management page (SPPG)                       │
│  ├── [x] Supplier orders page                               │
│  └── [x] Order tracking dashboard                           │
│                                                              │
│  Day 4: Frontend Features                                    │
│  ├── [x] Complaint management page                          │
│  ├── [x] Market/Analytics page                              │
│  ├── [x] Reports page                                       │
│  └── [x] Fix batch complaint form                           │
│                                                              │
│  Day 5: Polish & Ready for Testing                           │
│  ├── [x] End-to-end testing                                 │
│  ├── [ ] UI/UX polish                                       │
│  ├── [ ] Bug fixes                                          │
│  └── [x] Ready for user testing                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

# SIGIZI — Project Summary Komprehensif

> **Sistem Informasi Gizi Terintegrasi** — Platform GovTech Anti-Korupsi untuk Program Makan Bergizi Gratis (MBG)
> Tim: **TraceBite** (4 anggota) · Phase: MVP (~85%) · Updated: 2026-07-19

---

## 1. Ringkasan Eksekutif

SIGIZI adalah platform GovTech end-to-end yang menghubungkan **SPPG** (Satuan Pelaksana Pemberian Makanan Gratis), **supplier bahan baku**, dan **publik** dalam satu ekosistem transparan untuk program **MBG** (Makan Bergizi Gratis) pemerintah Indonesia. Solusi ini menjawab dua masalah utama: (1) **korupsi pengadaan** melalui algoritma validasi harga adaptif berbasis data pasar, dan (2) **opakitas publik** melalui traceability batch (QR + report key) dan kanal komplain tanpa login.

**Tujuan inti**: memastikan anggaran **Rp 10.000/porsi** MBG benar-benar sampai ke penerima manfaat (sekolah, panti asuhan, pesantren) tanpa kebocoran, sekaligus memberi transparansi gizi & alergen kepada masyarakat.

---

## 2. Konteks Domain & Masalah

### 2.1 Problem Statement
Program MBG pemerintah rentan penyimpangan:
- **Mark-up harga pengadaan**: tanpa pengawasan real-time, supplier dapat mematok harga di atas pasar.
- **Tidak ada traceability porsi**: publik (ortu/wali) tidak dapat memverifikasi gizi, alergen, dan asal bahan.
- **Keluhan tidak akuntabel**: masyarakat tidak punya kanal formal & terverifikasi.
- **Manipulasi stok**: SPPG belum punya akuntansi lot-based untuk mencegah fraud persediaan.

### 2.2 Stakeholders
| Stakeholder | Peran | Akses |
|-------------|-------|-------|
| **BGN** (Badan Gizi Nasional) | Regulator, SSO provider | SSO endpoint `mitra.bgn.go.id` |
| **SPPG** | Unit pelaksana MBG | JWT via SSO BGN, role `SPPG_ADMIN` |
| **Supplier** | Pemasok bahan baku (pasar/toko) | Email+password, role `SUPPLIER` |
| **Publik** | ortu/wali, masyarakat | Tanpa login (Cek Resi, Komplain, Cari SPPG) |
| **Beneficiary** | Sekolah, panti asuhan, pesantren | Dikelola SPPG |

### 2.3 Locus Pilot
**Cirebon, Jawa Barat** — 3 SPPG (Utara, Selatan, Barat), 9 pasar tradisional (Ciledug, Weru, Arjawinangun, Plumbon, Depok, Talun, Astanajapura, Plered, Kapetakan), ~81 supplier, 6 beneficiary. Dipilih karena merepresentasikan pasar MBG tipikal dengan fluktuasi harga & outlier yang relevan untuk validasi algoritma IQR.

---

## 3. Arsitektur Teknis

### 3.1 Stack
| Layer | Teknologi |
|-------|----------|
| **Backend** | NestJS 10.3, Prisma 5.10, PostgreSQL, Passport-JWT, bcrypt, class-validator, EventEmitter, Scheduler, Terminus, Swagger, Pino, PDFKit |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind 3.4, Leaflet, react-leaflet, QRCode, jsPDF + autotable, framer-motion, lucide-react, sonner (toast), nextjs-toploader, clsx, tailwind-merge, sharp |
| **Monorepo** | pnpm workspace, Turborepo 2 |
| **Infra** | Docker Compose (Postgres + Backend + Portal), `sigizi.go.id` (target domain) |
| **Shared** | `@sigizi/shared` (region normalization, tipe, konstanta) |

### 3.2 Arsitektur Backend — 12 Modul
```
apps/backend/src/
├── modules/
│   ├── auth/          # JWT + SSO BGN + register supplier
│   ├── sppg/          # DDD 4-layer: domain/application/infrastructure/presentation
│   ├── supplier/      # DDD 4-layer + nested items
│   ├── beneficiary/   # DDD 4-layer
│   ├── mou/           # MoU contract management
│   ├── order/         # State machine + price validation
│   ├── batch/         # FIFO production + QR/reportKey
│   ├── inventory/     # Event-driven lot-based FIFO/FEFO
│   ├── complaint/     # Public submit via reportKey
│   ├── market/        # IQR price validation algorithm (~840 baris)
│   ├── reports/       # Daily/weekly/monthly + PDF SHA-256 + scheduler
│   └── health/        # Terminus health check
├── core/
│   ├── domain/        # Value objects: GpsCoordinate, Address, Money, DateRange
│   └── utils/         # geolocation (Haversine)
└── common/            # Guards, Filters, Interceptors, Decorators
```

### 3.3 Pola Arsitektur
- **DDD 4-layer** pada modul inti (SPPG, Supplier, Beneficiary): `domain/` (entities, repositories interface, tokens) → `application/` (services, DTOs) → `infrastructure/prisma/` (repository impl) → `presentation/http/` (controllers).
- **Event-Driven**: `order.completed` → buat InventoryStock lot; `order.cancelled`/`batch.cancelled`/`batch.failed` → return stok.
- **State Machine**: Order (PENDING→CONFIRMED→DELIVERED→COMPLETED/CANCELLED), Batch (ACTIVE→COMPLETED/CANCELLED/FAILED), MoU (DRAFT→ACTIVE→EXPIRED/TERMINATED), Complaint (PENDING→REVIEWED→RESOLVED).
- **Role-Based Access Control**: 2 role (`SPPG_ADMIN`, `SUPPLIER`) dengan `RolesGuard` + `@Roles()` decorator.
- **Audit Trail Append-Only**: `OrderStatusHistory`, `InventoryAdjustmentLog` (SPOILAGE/THEFT/DISCREPANCY), `ReportSnapshot` (immutable + unique constraint).

### 3.4 Cross-Cutting Concerns
- **Request tracing**: `RequestIdMiddleware` (UUID `X-Request-Id`)
- **Logging terstruktur**: Pino + RequestLoggerMiddleware (duration)
- **Response format**: `ResponseTransformInterceptor` → `{ success, data, meta: { requestId, timestamp } }`
- **Error handling**: `PrismaExceptionFilter` (P2002/P2025 mapping) + `AllExceptionsFilter` (error code mapping)
- **Custom exceptions**: `InsufficientStockException`, `DomainError`/`InvalidTransitionError`/`InvariantViolationError`/`NotFoundError`
- **Swagger docs**: `/docs`
- **Global prefix**: `/api`

---

## 4. Model Data (Prisma)

### 4.1 14 Model Utama
| Model | Fungsi |
|-------|--------|
| **User** | Akun dengan role SPPG_ADMIN/SUPPLIER, link ke SPPG/Supplier |
| **Sppg** | Unit pelaksana dengan alamat terstruktur + GPS |
| **Supplier** | Pemasok dengan NIB, alamat, GPS, `isMarketSeller` + `marketName` |
| **SupplierItem** | Katalog harga (`basePrice`), soft delete, `minThreshold` |
| **Beneficiary** | Penerima manfaat (sekolah, panti, pesantren) |
| **Mou** | Kontrak SPPG-Supplier dengan `terms` JSON, `nibSnapshot`, `documentUrl` |
| **MouItem** | Item kontrak dengan `agreedPrice` (unique [mouId, itemId]) |
| **Order** | Pemesanan, link opsional ke MoU, tracking delivery/payment/cancellation |
| **OrderItem** | Detail dengan `unitPrice` dibekukan + `marketMedianAtPurchase` snapshot + `isWarningBypass` + `justificationNote` |
| **InventoryStock** | Lot-based stok, `purchasePrice` dikunci, FIFO + FEFO via `expiredAt` |
| **InventoryAdjustmentLog** | Audit trail penyesuaian |
| **OrderStatusHistory** | Append-only status order |
| **Batch** | Produksi makanan: `batchNumber`, `reportKey`, `menu`, `nutrition` JSON, `allergens`, `costPerPortion`, `totalCost`, `budgetVariance` vs Rp 10.000 |
| **BatchItem** | Bahan baku dengan link ke InventoryStock (FIFO tracking) |
| **Complaint** | Keluhan publik via `reportKey` |
| **OperationalExpense** | Pengeluaran non-batch/order (TRANSPORTATION/FUEL/...) |
| **ReportSnapshot** | Immutable report + `pdfHash` SHA-256 + unique [sppgId, type, periodKey] |

### 4.2 9 Enum
`Role`, `BatchStatus`, `ComplaintStatus`, `OrderStatus`, `MouStatus`, `StockSource` (SYSTEM_ORDER/MANUAL_ADJUSTMENT/BATCH_RETURN), `OperationalExpenseCategory`, `ReportType` (DAILY/WEEKLY/MONTHLY), `ReportSnapshotStatus` (DRAFT/FINAL).

---

## 5. Algoritma Inti — MarketService (Highlight Teknis)

File: [apps/backend/src/modules/market/services/market.service.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/modules/market/services/market.service.ts) (~840 baris)

### 5.1 Tujuan
**Anti-markup & anti-korupsi** — validasi setiap harga supplier vs data pasar real-time dengan statistik adaptif.

### 5.2 Komponen Algoritma
1. **Master Reference Prices** — 13 keyword-based reference (beras, ayam, sapi, telur, ikan, tahu, tempe, susu, minyak, wortel, bayam, sawi, kentang) untuk fallback cold-start.
2. **Dual Statistics** — `raw` (semua harga) + `clean` (setelah outlier removal).
3. **IQR (Interquartile Range)** outlier detection:
   - Q1, Q3 dari sorted prices
   - `lower = Q1 − 1.5×IQR`, `upper = Q3 + 1.5×IQR`
   - `MIN_IQR_SAMPLE = 4`, `MIN_MATURE_SAMPLE = 5`
4. **Scope Cascade** (adaptif berdasar sample size):
   - `district` → `regency` → `province` (admin cascade)
   - `gps_radius` (default 25km, expand ke 50km) via Haversine
   - `master` (fallback)
5. **HET (Harga Eceran Tertinggi) Suggestion** — 4 strategi:
   - `master_reference_cold_start` (sample = 0)
   - `blended_small_sample` (sample < 5, blend master+mean × 1.1)
   - `clean_dynamic_median` (mature, clean median × 1.1)
   - `all_anomaly_fallback`
6. **Integrated Price Validation** (`validatePrice`) → 3 status:
   - **VALID**: harga dalam IQR & ≤ median+15%
   - **WARNING**: harga > median+15% atau < IQR lower → wajib `justificationNote`
   - **INVALID**: harga > IQR upper atau > master×1.2 → ditolak

### 5.3 Transparansi Keputusan
Setiap decision disimpan di `MarketValidationContext` (itemName, masterPrice, scopeUsed, sampleCount, statistics, iqrBounds, basedOn) + snapshot `marketMedianAtPurchase` & `isWarningBypass` dibekukan di `OrderItem`, dan dimunculkan di Report PDF "Audit Table" (warningBypassCount + deviation %).

---

## 6. Algoritma Pendukung

### 6.1 FIFO/FEFO Inventory
File: [apps/backend/src/modules/batch/services/batch.service.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/modules/batch/services/batch.service.ts)
- Konsumsi lot tertua (`createdAt ASC`) dengan `remainingQty > 0`
- Split BatchItem jika satu item memotong 2 lot
- `unitPrice` dikunci dari `InventoryStock.purchasePrice`
- Auto-generate `batchNumber` (`BATCH-YYYYMMDD-NNN`) + `reportKey` (8 char random)
- Hitung `costPerPortion`, `totalBudget` (Rp 10.000 × beneficiary), `budgetVariance`

### 6.2 Event-Driven Inventory
File: [apps/backend/src/modules/inventory/inventory-event.handler.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/modules/inventory/inventory-event.handler.ts)
- `@OnEvent("order.completed")` → buat InventoryStock lot (source: SYSTEM_ORDER)
- `@OnEvent("order.cancelled")` → hapus stok jika previousStatus COMPLETED
- `@OnEvent("batch.cancelled")` / `batch.failed` → return stok (source: BATCH_RETURN)

### 6.3 Haversine Geolocation
File: [apps/backend/src/core/utils/geolocation.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/core/utils/geolocation.ts)
- `calculateDistanceKm`, `findWithinRadius` untuk SPPG search & supplier proximity

### 6.4 PDF Immutable Report
File: [apps/backend/src/modules/reports/services/pdf-generator.service.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/modules/reports/services/pdf-generator.service.ts)
- PDFKit generate + **SHA-256 hash** untuk integritas audit
- Header, summary, COGS, Procurement, **Audit Table** (price validation bypass), OpEx

### 6.5 Scheduler Cron (Asia/Jakarta)
File: [apps/backend/src/modules/reports/services/reports-scheduler.service.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/modules/reports/services/reports-scheduler.service.ts)
- Daily: `0 10 0 * * *` (00:10)
- Weekly: `0 15 0 * * 1` (00:15 Senin)
- Monthly: `0 20 0 1 * *` (00:20 tanggal 1)

---

## 7. Frontend — 25 Halaman

### 7.1 Publik (tanpa login)
- [Home](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/page.tsx) — tab "Cek Resi" + "Cari SPPG" (region cascading + GPS Haversine)
- [Batch Verify](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/batch/verify/[batchNumber]/page.tsx) — gizi, alergen, biaya, form komplain via reportKey
- [Batch Lookup](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/batch/page.tsx)
- [SPPG Search](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/sppg/page.tsx) + [SPPG Detail](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/sppg/[id]/page.tsx)
- [Login](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/auth/login/page.tsx) + [Register](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/auth/register/page.tsx) + [SSO Redirect](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/auth/sso-redirect/page.tsx) + [Dev Login](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/auth/dev-login/page.tsx)

### 7.2 Admin (SPPG_ADMIN)
- [Dashboard](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/page.tsx) — stats: porsi, laporan aktif, total biaya, reputasi vendor
- [Suppliers](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/suppliers/page.tsx) — CRUD + create page
- [Batches](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/batches/page.tsx) — card ringkas + report key + detail modal + 12 feature components
- [Complaints](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/complaints/page.tsx) — 7 components: stats, filter, table, detail modal, resolve modal
- [Market/Analytics](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/market/page.tsx) — price charts + 7 components + skeleton
- [Reports](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/reports/page.tsx) — daily/weekly + 9 components
- [Inventory](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/inventory/page.tsx) — stock management
- [Beneficiaries](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/beneficiaries/page.tsx) — CRUD
- [Payments](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/payments/[invoiceId]/page.tsx) — payment evidence
- [Setup Location](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/setup-location/page.tsx)
- [Profile](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/profile/page.tsx)

### 7.3 Supplier (SUPPLIER)
- [Dashboard](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/supplier/page.tsx) — pesanan hari ini, katalog available/unavailable, MoU aktif
- [Pesanan](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/supplier/pesanan/page.tsx) — view/accept incoming orders + 10 components
- [Katalog](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/supplier/katalog/page.tsx)
- [MoU](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/supplier/mou/page.tsx)
- [Profil](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/supplier/profil/page.tsx)

### 7.4 Komponen UI Kunci
- `Skeleton.tsx` + skeleton loading di 11 halaman
- `ErrorBoundary` + `PageErrorBoundary`
- `AdminStatsCard`, `AdminStatsGrid`, `StatsCard` (supplier)
- `RegionCascadingSelect`, `LocationToggle`
- `BatchStatusBadge`, `DemoNoticeModal`, `DemoAccountCard`
- `phantom-ui` external library (@aejkatappaja/phantom-ui)
- Toast: `sonner` · Loader: `nextjs-toploader` · Icons: `lucide-react` · Animation: `framer-motion`

---

## 8. API Endpoints (~60+)

### Auth (`/api/auth`)
- `POST /sso` · `GET /callback` · `POST /register` · `POST /login` · `GET /me` · `GET /dev-users` (dev) · `GET /dev-login` (dev)

### SPPG (`/api/sppg` + `/api/public/sppg`)
- CRUD + **Public**: search by region/GPS Haversine, batches summary, profile (cache `public, max-age=300, stale-while-revalidate=600`)

### Supplier (`/api/suppliers`)
- CRUD + `/me` (JWT) + nested items (POST/PATCH/DELETE dengan soft/hard delete)

### Beneficiary, MoU, Order, Batch, Complaint
- CRUD dengan role guard + state transition

### Market (`/api/market`)
- `/regions` · `/markets` · `/prices` · `/anomalies` (IQR) · `/het-suggestion` · `/validate-price`

### Inventory (`/api/inventory`)
- `POST /manual` · `PATCH /:id/adjust` · `GET /` · `/balance` · `/valuation` · `/alerts` · `/:id/history`

### Reports (`/api/reports`)
- `/daily` · `/weekly` · `/monthly` · `/expenses` (granular COGS/PROCUREMENT/OPEX/ALL) · `/:id/download` · `/operational-expenses` CRUD

### Health (`/api/health`)
- `/` (full) · `/live` (liveness) · `/ready` (readiness)

---

## 9. Auth & Security

### 9.1 Alur Autentikasi
- **Production (SSO BGN)**: frontend `POST /api/auth/sso` → backend return redirect ke `https://mitra.bgn.go.id/sso/authorize?client_id=sigizi&state=...` → user login di BGN → callback `GET /api/auth/callback` → return JWT
- **Dev login**: `GET /auth/dev-login?role=...&userId=...` (tanpa password, hanya `NODE_ENV=development`)
- **Email/password**: register supplier (transaksi buat Supplier+User+bcrypt) → login (bcrypt compare) → JWT 7 hari

### 9.2 JWT
- Secret: `JWT_SECRET` (default `sigizi-secret-key`)
- Expiry: `JWT_EXPIRES_IN` (default `7d`)
- Payload: `{ sub: user.id, email, role }`
- Strategy: `JwtStrategy` → `AuthService.validateToken`

### 9.3 Akun Seed (password: `password123`)
- `admin-cirebon-utara@sigizi.go.id`
- `admin-cirebon-selatan@sigizi.go.id`
- `admin-cirebon-barat@sigizi.go.id`
- `supplier-01@sigizi.go.id` ... `supplier-18@sigizi.go.id`
- `supplier-market-{1-9}-{1-7}@sigizi.go.id` (60 market sellers)

---

## 10. Seed Data & Simulasi

File: [apps/backend/prisma/seed.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/prisma/seed.ts) (2080 baris, deterministic via `seededRandom` Math.sin)

- **3 SPPG** + **3 admin SPPG**
- **18 supplier awal** (9 market sellers + 9 non-market) + **60 market sellers generated** = ~81 user
- **~85+ SupplierItem** di 9 pasar, 16 jenis (beras, ayam, telur, tahu, tempe, bayam, wortel, minyak, kentang, kangkung, ikan tongkol/lele, tepung, sapi, bawang, cabai, gula, garam)
- **Mature market** (5–14 suppliers/item) untuk IQR + **cold start** (3–4 suppliers) untuk master fallback
- **Outlier terkendali** (5% kemungkinan, 1.5× atau 0.5× base) untuk trigger anomaly detection
- **6 Beneficiary** (2 per SPPG: SDN, SMPN, Panti Asuhan)
- **2 MoU ACTIVE** + **7 Orders** (varied status, 1 dengan WARNING bypass Ayam 40000 vs median 35000 + justification "Stok lokal langka")
- **3 Batches** + nutrition info + budgetVariance
- **2 Complaints** + **5 Inventory Lots** + **1 Adjustment Log** (SPOILAGE) + **2 Operational Expenses**

---

## 11. Status & Roadmap

### 11.1 Status Saat Ini (Phase 1: MVP)
Lihat [docs/PROJECT_STATUS.md](file:///c:/MYPROJECTS/HACKATHON/sigizi/docs/PROJECT_STATUS.md)

**Backend**: 12/12 modul ✅ 100%
**Frontend**: 13/13 halaman ✅ 100% + skeleton + error boundary
**Komponen**: Layout, AuthContext, reusable UI (Button 4 variants, Card, Badge 5 variants, Input, Pagination, FileUpload), Skeleton (11 halaman), ErrorBoundary ✅ 100%
**Infra**: Docker Compose 90%, Prisma migration 100%, seed 100%
**Overall**: ~85%

### 11.2 Yang Belum (Phase 2: Post-MVP)
- Real SSO BGN token exchange
- Redis caching (price statistics, session)
- BullMQ queue (async PDF generation)
- WebSocket (real-time batch updates)
- File upload S3 (evidence, MoU document)
- Elasticsearch (full-text search)
- Role-based UI routing yang lebih granular

### 11.3 Yang Belum (Phase 3: Production)
- CI/CD pipeline (GitHub Actions)
- Kubernetes / Docker Swarm deployment
- SSL Let's Encrypt + domain `sigizi.go.id`
- Monitoring (Grafana/Prometheus) + logging (Loki/ELK) + APM (Sentry)
- OWASP security audit + penetration testing
- Rate limiting + CORS hardening
- Backup & disaster recovery

---

## 12. Eksekusi & Pilot

### 12.1 Rencana Eksekusi MVP
- **Minggu 1**: `docker-compose up` end-to-end, validasi flow: login SPPG → create order + IQR → supplier accept → COMPLETED → batch FIFO → publik cek resi → komplain. Polish UI/UX.
- **Pilot 1 (Cirebon)**: onboarding 3 SPPG + 9 pasar dengan data real. Metrik:
  - 100% order tervalidasi IQR
  - 0 harga anomali lolos tanpa justification
  - Publik cek resi < 3 detik
  - Laporan harian auto-generated tanpa intervensi manual
- **Deploy**: Docker Compose ke VPS, subdomain pilot, SSL Let's Encrypt, monitoring uptime dasar
- **Pilot 2**: tambah SPPG di kabupaten tetangga + koordinasi SSO BGN real

### 12.2 Business Model
- **B2G (Business-to-Government)**: lisensi tahunan ke pemerintah daerah / Kementerian BGN, harga per SPPG terdaftar
- **SaaS tier**: dasar (1–5 SPPG) → pro (multi-SPPG + analytics) → enterprise (multi-province + SSO BGN real)
- **Add-on**: custom report, payment gateway integration, AI menu rekomendasi (post-MVP)

### 12.3 ROI Proyeksi
- 1 SPPG: 1000 porsi/hari × Rp 10.000 × 200 hari × 20% leakage = **Rp 400 juta/tahun** terhindar
- 1 provinsi (30 SPPG): **~Rp 12 miliar/tahun** vs lisensi Rp 50–100 juta/tahun = ROI 120–240×

---

## 13. Tim & Pembagian Peran

**TraceBite — 4 anggota**

| Peran | Tanggung Jawab | Own |
|-------|----------------|-----|
| **Backend Lead** | NestJS + Prisma + DDD + MarketService IQR + event-driven inventory | `apps/backend/`, `packages/shared` |
| **Frontend Lead** | Next.js 14 + Tailwind + Leaflet + QR + jsPDF | `apps/portal/` |
| **Full-stack / Integrator** | Docker Compose, Turborepo, seed 2080 baris, e2e testing | root configs |
| **Product/Domain** | PROJECT_STATUS, hackathon docs, alur bisnis MBG, koordinasi SSO BGN | `docs/` |

**Kompetensi kolektif**: DDD 4-layer, event-driven, state machine, IQR statistik, FIFO accounting, PDF immutable hash, Haversine geolocation, Next.js CSR/SSR boundary.

**Commit convention**: `[backend]` / `[frontend]` / `[shared]` / `[config]` / `[docs]` + auto-label GitHub Actions.

**Skill library internal** (20 skill di `docs/backend/skills/` & `docs/frontend/skills/`): `nestjs-module-scaffold`, `ddd-boundary-rules`, `prisma-conventions`, `repository-pattern`, `controller-pattern`, `mapper-pattern`, `validation-pattern`, `transaction-pattern`, `exception-pattern`, `testing-pattern`, `nextjs-ssr-csr-boundary`, `nextjs-page-pattern`, `react-component-pattern`, `tailwind-styling-pattern`, `api-integration-pattern`, `form-pattern`, `state-management-pattern`, `error-handling-pattern`, `loading-pattern`, `testing-pattern`.

---

## 14. Competitive Moat

1. **Algoritma IQR adaptif + scope cascade** (~840 baris) + 13 master reference = barrier teknis tinggi.
2. **Audit trail immutable** (OrderStatusHistory append-only + PDF SHA-256 + ReportSnapshot unique constraint) → kepatuhan regulasi BGN, sulit ditiru spreadsheet/SI manual lama.
3. **Event-driven FIFO accounting** → konsistensi finansial audit-able.
4. **Public trust loop**: komplain publik + cek resi → tekanan transparansi yang kompetitor tidak punya.
5. **Network effect**: lebih banyak supplier → lebih akurat IQR → lebih banyak SPPG → lebih banyak supplier.

---

## 15. Referensi File Kunci

| Area | File |
|------|------|
| Root | [package.json](file:///c:/MYPROJECTS/HACKATHON/sigizi/package.json), [docker-compose.yml](file:///c:/MYPROJECTS/HACKATHON/sigizi/docker-compose.yml), [README.md](file:///c:/MYPROJECTS/HACKATHON/sigizi/README.md) |
| Status | [docs/PROJECT_STATUS.md](file:///c:/MYPROJECTS/HACKATHON/sigizi/docs/PROJECT_STATUS.md), [docs/HACKATHON_QUESTION.md](file:///c:/MYPROJECTS/HACKATHON/sigizi/docs/HACKATHON_QUESTION.md) |
| Backend entry | [apps/backend/src/main.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/main.ts), [apps/backend/src/app.module.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/app.module.ts) |
| Database | [apps/backend/prisma/schema.prisma](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/prisma/schema.prisma), [apps/backend/prisma/seed.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/prisma/seed.ts) |
| Algoritma | [apps/backend/src/modules/market/services/market.service.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/modules/market/services/market.service.ts) |
| Inventory event | [apps/backend/src/modules/inventory/inventory-event.handler.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/modules/inventory/inventory-event.handler.ts) |
| PDF | [apps/backend/src/modules/reports/services/pdf-generator.service.ts](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/backend/src/modules/reports/services/pdf-generator.service.ts) |
| Frontend home | [apps/portal/src/app/page.tsx](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/page.tsx) |
| Frontend dashboard | [apps/portal/src/app/admin/page.tsx](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/admin/page.tsx), [apps/portal/src/app/supplier/page.tsx](file:///c:/MYPROJECTS/HACKATHON/sigizi/apps/portal/src/app/supplier/page.tsx) |

---

_Dokumen ini digenerate dari analisis codebase aktual per 2026-07-19. Untuk status real-time, lihat [docs/PROJECT_STATUS.md](file:///c:/MYPROJECTS/HACKATHON/sigizi/docs/PROJECT_STATUS.md)._
