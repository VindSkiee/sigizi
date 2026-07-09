# SIGIZI Agent Configuration

---

## ⚠️ FIRST TIME SETUP (WAJIB DIBACA)

**Sebelum memulai pekerjaan apapun, agent WAJIB:**

1. Baca `docs/UNIVERSAL_SETUP.md` untuk instruksi setup lengkap
2. Pastikan dependencies sudah terinstall (`pnpm install`)
3. Pastikan `.env` sudah dikonfigurasi
4. Pastikan database sudah running dan migrated
5. Baca `docs/PROJECT_STATUS.md` untuk cek status project

**Jika setup belum lengkap, guide user untuk menyelesaikan setup terlebih dahulu.**

---

## Pilih Role

```
┌─────────────────────────────────────────────────────────────┐
│                    PILIH ROLE ANDA                          │
├─────────────────────────────────────────────────────────────┤
│  @backend  - Bekerja di apps/backend/ (NestJS + Prisma)    │
│  @frontend - Bekerja di apps/portal/ (Next.js + Tailwind)  │
│  @shared   - Bekerja di packages/shared/ (keduanya boleh)  │
└─────────────────────────────────────────────────────────────┘
```

### Role Selection

Sebelum memulai, TENTUKAN role Anda:

```
Saya adalah agent @backend  → Baca docs/backend/GUIDE.md
Saya adalah agent @frontend → Baca docs/frontend/GUIDE.md
```

---

## MCP & Skills

### Backend Agent

```
Wajib Baca:
├── docs/backend/GUIDE.md           # Development guide
├── docs/backend/PATTERNS.md        # Code patterns
├── docs/backend/SKILLS.md          # Backend skills
├── docs/backend/MCP.md             # MCP servers
└── docs/backend/CONTEXT_RECOVERY.md # Context recovery
```

**Skills:**
- nestjs-module-scaffold
- prisma-migration-convention
- ddd-boundary-rules
- nestjs-controller-pattern

**MCP:**
- PostgreSQL MCP (read-only)
- Git MCP
- GitHub MCP
- Filesystem MCP
- Context7 MCP
- Memory MCP

### Frontend Agent

```
Wajib Baca:
├── docs/frontend/GUIDE.md           # Development guide
├── docs/frontend/PATTERNS.md        # UI patterns
├── docs/frontend/SKILLS.md          # Frontend skills
├── docs/frontend/MCP.md             # MCP servers
└── docs/frontend/CONTEXT_RECOVERY.md # Context recovery
```

**Skills:**
- nextjs-ssr-csr-boundary
- nextjs-page-pattern
- react-component-pattern
- tailwind-styling-pattern
- api-integration-pattern

**MCP:**
- Git MCP
- GitHub MCP
- Filesystem MCP
- Context7 MCP
- Memory MCP
- Playwright MCP

### Shared MCP (Semua Role)

| MCP Server | Purpose |
|------------|---------|
| Git MCP | Operasi git lokal |
| GitHub MCP | Repository, PR, Issues |
| Filesystem MCP | Baca/tulis file |
| Context7 MCP | Up-to-date library docs |
| Memory MCP | Project context |
| Fetch MCP | Baca API docs eksternal |
| Sequential Thinking MCP | Task kompleks |

---

## Workflow

### 1. Inisialisasi Session

```bash
# Baca config ini (file ini)
# Pilih role Anda
# Baca GUIDE.md sesuai role
# Baca session_logs/<role>/ terakhir untuk recovery
```

### 2. Selama Bekerja

```
SETEAP 10 TOOL CALLS:
├── Apakah context > 60%? 
│   ├── YA → Simpan checkpoint ke session_logs
│   └── TIDAK → Lanjutkan
│
SETEAP TASK SELESAI:
├── Update session log
├── Commit dengan prefix [backend]/[frontend]/[shared]
└── Push jika sudah selesai
```

### 3. Selesai Session

```
SEBELUM BERHENTI:
├── Simpan SEMUA progress ke session_logs/<role>/
├── Tulis ringkasan:
│   - Task yang dikerjakan
│   - File yang diubah
│   - Blocker yang ditemui
│   - Next steps
├── Commit perubahan
└── Push ke remote
```

---

## File Structure Ownership

```
┌─────────────────────────────────────────────────────────────┐
│  PATH                        │  OWNER       │  EDIT ACCESS  │
├─────────────────────────────────────────────────────────────┤
│  apps/backend/**             │  @backend    │  @backend     │
│  apps/portal/**              │  @frontend   │  @frontend    │
│  packages/shared/**          │  shared      │  @backend     │
│                              │              │  @frontend    │
│  docs/backend/**             │  @backend    │  @backend     │
│  docs/frontend/**            │  @frontend   │  @frontend    │
│  docs/shared/**              │  shared      │  @backend     │
│                              │              │  @frontend    │
│  docs/API.md                 │  shared      │  @backend     │
│  docs/DATABASE.md            │  @backend    │  @backend     │
│  docs/DEPLOYMENT.md          │  shared      │  @lead        │
│  session_logs/backend/**     │  @backend    │  @backend     │
│  session_logs/frontend/**    │  @frontend   │  @frontend    │
│  AGENTS.md                   │  lead        │  lead         │
│  CONTRIBUTING.md             │  lead        │  lead         │
│  Root configs                │  lead        │  lead         │
└─────────────────────────────────────────────────────────────┘
```

---

## Commit Convention

```bash
# Format
[prefix] Deskripsi perubahan

# Contoh
[backend] add supplier CRUD endpoint
[frontend] create batch tracking page
[shared] update TypeScript types for Batch
[config] setup docker-compose
[docs] update API documentation
```

### Auto Label GitHub

| Prefix | Label | Reviewer |
|--------|-------|----------|
| `[backend]` | `backend` | `@tracebite/backend-team` |
| `[frontend]` | `frontend` | `@tracebite/frontend-team` |
| `[shared]` | `shared` | Both teams |
| `[config]` | `config` | Lead |

---

## Context Recovery Protocol

### Kapan Harus Save Context?

```
┌─────────────────────────────────────────────────────────────┐
│  CONTEXT WARNING TRIGGERS:                                  │
├─────────────────────────────────────────────────────────────┤
│  1. Context > 60% digunakan                                │
│  2. Setelah 15 tool calls berturut-turut                   │
│  3. Setelah menyelesaikan 1 task besar                     │
│  4. Sebelum memulai task baru yang kompleks                 │
│  5. Ketika merasa "mulai lupa" konteks sebelumnya           │
└─────────────────────────────────────────────────────────────┘
```

### Bagaimana Save Context?

```bash
# 1. Buat/simpan session log
# Lokasi: session_logs/<role>/YYYY-MM-DD_HH-MM.md

# 2. Isi minimal:
# - Current task description
# - Files modified (list)
# - Decisions made
# - Blockers encountered  
# - Next steps
# - Code snippets penting (jika ada)
```

### Bagaimana Recovery Context?

```bash
# 1. Baca session_logs/<role>/ paling baru
# 2. Baca docs/<role>/CONTEXT_RECOVERY.md
# 3. Verifikasi file yang sudah ada di disk
# 4. Lanjutkan dari checkpoint terakhir
```

---

## Phase Management

### Current Phase Status

```
┌─────────────────────────────────────────────────────────────┐
│  CURRENT PHASE: 🚀 Phase 1: MVP (Hackathon Demo)           │
│  PROGRESS: ~35-40%                                          │
│  STATUS: 🟡 IN PROGRESS                                     │
│  DOCUMENTATION: docs/PROJECT_STATUS.md                      │
└─────────────────────────────────────────────────────────────┘
```

### Phase Transition Rules

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  PHASE TRANSITION CHECK REQUIRED                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  KETIKA USER MEMINTA KERJA DI PHASE SELANJUTNYA:            │
│                                                              │
│  1. Baca docs/PROJECT_STATUS.md                             │
│  2. Cek apakah semua Must-Haves phase saat ini sudah done   │
│  3. JIKA BELUM:                                              │
│     ┌─────────────────────────────────────────────────────┐  │
│     │  ⚠️  WARNING: PHASE PREREQUISITES NOT MET           │  │
│     │                                                      │  │
│     │  Anda meminta kerja di Phase [X], namun:            │  │
│     │  - [ ] [Item 1 belum selesai]                        │  │
│     │  - [ ] [Item 2 belum selesai]                        │  │
│     │                                                      │  │
│     │  RECOMMENDATION: Selesaikan phase saat ini dulu     │  │
│     │  atau konfirmasi untuk melanjutkan.                  │  │
│     └─────────────────────────────────────────────────────┘  │
│                                                              │
│  4. JIKA SUDAH: Lanjutkan dengan normal                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Phase Prerequisites

#### MVP → Post-MVP

```
WAJIB SELESAIKAN:
□ All backend modules (Order, SPPG, Beneficiary)
□ All frontend pages (Login, Dashboard, Management pages)
□ Auth flow complete (Login + Context)
□ Docker Compose tested
□ Basic E2E testing
```

#### Post-MVP → Production

```
WAJIB SELESAIKAN:
□ Real SSO BGN integration
□ Role-based UI
□ Redis caching
□ Security audit
□ Load testing
□ Monitoring setup
□ CI/CD pipeline
```

### Agent Phase Check Protocol

```bash
# SAAT MEMULAI SESSION:
1. Baca docs/PROJECT_STATUS.md
2. Catat current phase dan progress
3. Identifikasi blocker/keterlambatan

# SAAT USER MEMINTA TASK BARU:
1. Cek task tersebut termasuk phase mana
2. Jika phase berbeda dari current:
   - Tampilkan warning
   - List prerequisites yang belum terpenuhi
   - Minta konfirmasi untuk melanjutkan

# SAAT MENYELESAIKAN TASK:
1. Update docs/PROJECT_STATUS.md
2. Tandai item yang selesai
3. Cek apakah phase sudah lengkap
```

---

## Strict Rules

### DO ✅

```
1. SELALU pilih role sebelum mulai
2. SELALU baca GUIDE.md sesuai role
3. SELALU update session log setiap 10 tool calls
4. SELALU save context sebelum context > 70%
5. SELALU commit dengan prefix yang benar
6. SELALU baca session log terakhir saat recovery
7. SELALU verifikasi file exist sebelum edit
8. SELALU cek phase status sebelum mulai task baru
9. SELALU warning jika user skip phase
```

### DON'T ❌

```
1. JANGAN edit file di luar role Anda (kecuali packages/shared/)
2. JANGAN skip session log update
3. JANGAN mulai task baru tanpa save context
4. JANGAN push tanpa commit message yang jelas
5. JANGAN abaikan error - selesaikan dulu
6. JANGAN guess struktur file - baca dulu
7. JANGAN lanjutkan ke phase baru tanpa cek prerequisites
8. JANGAN skip phase tanpa konfirmasi user
```

---

## Quick Reference

### Backend Commands

```bash
cd apps/backend
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm prisma:migrate         # Run migrations
pnpm prisma:studio          # Open Prisma Studio
pnpm prisma:seed            # Seed database
```

### Frontend Commands

```bash
cd apps/portal
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm lint                   # Run linter
```

### Shared Package

```bash
cd packages/shared
# Edit src/types/index.ts for shared types
# Edit src/constants/index.ts for shared constants
```

---

## Session Log Template

```markdown
# Session Log - [ROLE] - [DATE]

## Current Task
[Deskripsi task yang sedang dikerjakan]

## Progress
- [ ] Subtask 1
- [x] Subtask 2 (selesai)
- [ ] Subtask 3

## Files Modified
- `path/to/file1.ts` - Deskripsi perubahan
- `path/to/file2.ts` - Deskripsi perubahan

## Decisions Made
- Keputusan 1: Alasan
- Keputusan 2: Alasan

## Blockers
- Blocker 1: Deskripsi & cara mengatasi

## Next Steps
1. Step selanjutnya
2. Step setelah itu

## Code Snippets (jika perlu)
```typescript
// Code penting yang perlu diingat
```

## Checkpoint
- Context usage: ~X%
- Last tool call: [nama tool]
- Timestamp: [waktu]
```

---

## OpenCode Configuration

### For OpenCode Users

```bash
# Install OpenCode
curl -fsSL https://opencode.ai/install | bash

# Start OpenCode in project root
cd /path/to/sigizi
opencode

# Select agent: Tab key to switch between backend/frontend
```

### Configuration Files

| File | Purpose |
|------|---------|
| `opencode.json` | Main OpenCode configuration |
| `.opencode/agents/backend.md` | Backend agent prompt |
| `.opencode/agents/frontend.md` | Frontend agent prompt |
| `.opencode/commands/` | Custom commands |

### MCP Servers

All MCP servers are configured in `opencode.json`:
- Git MCP - Version control
- GitHub MCP - Repository API
- Filesystem MCP - File operations
- PostgreSQL MCP - Database queries
- Context7 MCP - Documentation
- Memory MCP - Project context

### Skills

Skills are located in:
- `docs/backend/skills/` - Backend skills
- `docs/frontend/skills/` - Frontend skills

Load skills using the `skill` tool:
```
Use the skill tool to load: nestjs-module-scaffold
```

### Commands

Available commands:
- `/install` - Install all dependencies
- `/migrate` - Run Prisma migrations
- `/seed` - Seed database
- `/dev` - Start development servers
