# Backend Context Recovery Protocol

## Tujuan

File ini membantu agent recovery context ketika context window mulai penuh atau session terputus.

---

## Context Warning Triggers

```
┌─────────────────────────────────────────────────────────────┐
│  KETIKA INI TERJADI, HARUS SAVE CONTEXT:                   │
├─────────────────────────────────────────────────────────────┤
│  1. Context > 60% digunakan                                │
│  2. Setelah 15 tool calls berturut-turut                   │
│  3. Setelah menyelesaikan 1 task besar                     │
│  4. Sebelum memulai task baru yang kompleks                 │
│  5. Ketika merasa "mulai lupa" konteks sebelumnya           │
└─────────────────────────────────────────────────────────────┘
```

---

## Save Context Procedure

### 1. Buat Session Log

Lokasi: `session_logs/backend/YYYY-MM-DD_HH-MM.md`

### 2. Isi Minimum

```markdown
# Session Log - Backend - 2026-07-09

## Current Task
Implementasi supplier CRUD endpoint

## Progress
- [x] Create SupplierService
- [x] Create SupplierController
- [ ] Add validation
- [ ] Write tests

## Files Modified
- `src/modules/supplier/supplier.service.ts` - Added findAll, findById
- `src/modules/supplier/supplier.controller.ts` - Added endpoints

## Decisions Made
- Use Prisma for DB queries
- Follow NestJS module pattern

## Blockers
- None

## Next Steps
1. Add DTO validation
2. Write unit tests
3. Update API docs

## Code Snippets
```typescript
// Supplier service pattern
async findAll() {
  return this.prisma.supplier.findMany();
}
```

## Checkpoint
- Context usage: ~45%
- Last tool call: Edit supplier.service.ts
- Timestamp: 2026-07-09 14:30
```

---

## Recovery Procedure

### Step 1: Read Session Logs

```bash
# Baca session log terakhir
cat session_logs/backend/*.md | tail -100
```

### Step 2: Read Context Recovery Guide

```bash
# Baca file ini
cat docs/backend/CONTEXT_RECOVERY.md
```

### Step 3: Verify Files on Disk

```bash
# Cek file yang sudah ada
ls -la apps/backend/src/modules/
ls -la apps/backend/prisma/
```

### Step 4: Verify Git Status

```bash
# Cek status git
git status
git log --oneline -10
```

### Step 5: Resume from Checkpoint

1. Baca "Next Steps" dari session log terakhir
2. Verifikasi file yang sudah diubah masih ada
3. Lanjutkan dari task yang terhenti

---

## Session Log Template

```markdown
# Session Log - Backend - [YYYY-MM-DD HH:MM]

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

## Quick Recovery Checklist

```
□ Baca docs/PROJECT_STATUS.md (CEK PHASE!)
□ Baca session_logs/backend/ terakhir
□ Baca docs/backend/GUIDE.md
□ Baca docs/backend/PATTERNS.md
□ Baca docs/backend/SKILLS.md
□ Baca docs/backend/MCP.md
□ Cek git status
□ Verifikasi file yang sudah ada
□ Lanjutkan dari checkpoint
```

### Phase Check

```bash
# SAAT RECOVERY, CEK PHASE:
1. Baca docs/PROJECT_STATUS.md
2. Cek current phase: [Phase 1: MVP]
3. Cek progress: [~35-40%]
4. Jika user meminta task dari phase berbeda:
   - Tampilkan warning
   - List prerequisites yang belum terpenuhi
   - Minta konfirmasi
```

### MCP Servers (Backend)

| Server | Purpose |
|--------|---------|
| PostgreSQL MCP | DB queries (read-only) |
| Git MCP | Version control |
| GitHub MCP | Remote repo |
| Filesystem MCP | File operations |
| Context7 MCP | Library docs |
| Memory MCP | Project context |

### Skills (Backend)

| Skill | Use When |
|-------|----------|
| nestjs-module-scaffold | Creating new module |
| prisma-migration-convention | Database changes |
| ddd-boundary-rules | Module interactions |
| nestjs-controller-pattern | API endpoints |

---

## Important Files

| File | Purpose |
|------|---------|
| `apps/backend/src/main.ts` | Entry point |
| `apps/backend/src/app.module.ts` | Root module |
| `apps/backend/prisma/schema.prisma` | Database schema |
| `apps/backend/src/modules/*/` | Business logic |
| `docs/API.md` | API documentation |
| `docs/DATABASE.md` | Database schema |

---

## Common Commands

```bash
# Development
cd apps/backend
pnpm dev

# Database
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:studio
pnpm prisma:seed

# Build
pnpm build
```

---

## See Also

- [GUIDE.md](./GUIDE.md) - Main development guide
- [PATTERNS.md](./PATTERNS.md) - Code patterns & conventions
- `AGENTS.md` - Main agent configuration
