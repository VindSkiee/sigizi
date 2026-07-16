# Frontend Context Recovery Protocol

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

Lokasi: `session_logs/frontend/YYYY-MM-DD_HH-MM.md`

### 2. Isi Minimum

```markdown
# Session Log - Frontend - 2026-07-09

## Current Task
Implementasi batch tracking page

## Progress
- [x] Create BatchCard component
- [x] Create BatchDetails component
- [ ] Add loading state
- [ ] Add error handling

## Files Modified
- `src/components/features/batch/BatchCard.tsx` - Created component
- `src/components/features/batch/BatchDetails.tsx` - Created component
- `src/app/batch/page.tsx` - Updated page

## Decisions Made
- Use CSR for batch page
- Follow existing component patterns

## Blockers
- None

## Next Steps
1. Add loading spinner
2. Add error boundary
3. Write tests

## Code Snippets
```tsx
// Batch card pattern
export function BatchCard({ batch }: BatchCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold">{batch.batchNumber}</h3>
    </div>
  );
}
```

## Checkpoint
- Context usage: ~40%
- Last tool call: Edit batch/page.tsx
- Timestamp: 2026-07-09 15:00
```

---

## Recovery Procedure

### Step 1: Read Session Logs

```bash
# Baca session log terakhir
cat session_logs/frontend/*.md | tail -100
```

### Step 2: Read Context Recovery Guide

```bash
# Baca file ini
cat docs/frontend/CONTEXT_RECOVERY.md
```

### Step 3: Verify Files on Disk

```bash
# Cek file yang sudah ada
ls -la apps/portal/src/app/
ls -la apps/portal/src/components/
ls -la apps/portal/src/lib/
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
# Session Log - Frontend - [YYYY-MM-DD HH:MM]

## Current Task
[Deskripsi task yang sedang dikerjakan]

## Progress
- [ ] Subtask 1
- [x] Subtask 2 (selesai)
- [ ] Subtask 3

## Files Modified
- `path/to/file1.tsx` - Deskripsi perubahan
- `path/to/file2.tsx` - Deskripsi perubahan

## Decisions Made
- Keputusan 1: Alasan
- Keputusan 2: Alasan

## Blockers
- Blocker 1: Deskripsi & cara mengatasi

## Next Steps
1. Step selanjutnya
2. Step setelah itu

## Code Snippets (jika perlu)
```tsx
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
□ Baca session_logs/frontend/ terakhir
□ Baca docs/frontend/GUIDE.md
□ Baca docs/frontend/PATTERNS.md
□ Baca docs/frontend/SKILLS.md
□ Baca docs/frontend/MCP.md
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

### MCP Servers (Frontend)

| Server | Purpose |
|--------|---------|
| Git MCP | Version control |
| GitHub MCP | Remote repo |
| Filesystem MCP | File operations |
| Context7 MCP | Library docs |
| Memory MCP | Project context |
| Playwright MCP | E2E testing |

### Skills (Frontend)

| Skill | Use When |
|-------|----------|
| nextjs-ssr-csr-boundary | SSR vs CSR decision |
| nextjs-page-pattern | Creating new page |
| react-component-pattern | Creating component |
| tailwind-styling-pattern | Styling components |
| api-integration-pattern | API calls |

---

## Important Files

| File | Purpose |
|------|---------|
| `apps/portal/src/app/layout.tsx` | Root layout |
| `apps/portal/src/app/page.tsx` | Home page (CSR) |
| `apps/portal/src/app/batch/page.tsx` | Batch tracking (SSR) |
| `apps/portal/src/lib/api.ts` | API client |
| `apps/portal/src/lib/utils.ts` | Utility functions |
| `apps/portal/tailwind.config.js` | Tailwind config |

---

## Common Commands

```bash
# Development
cd apps/portal
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
```

---

## Rendering Reminders

```
CSR (Client-Side Rendering):
- Use 'use client' directive
- Data fetched in useEffect
- Good for: dashboards, user-specific

SSR (Server-Side Rendering):
- No 'use client' directive
- Data fetched in component (async)
- Good for: public pages, SEO
```

---

## See Also

- [GUIDE.md](./GUIDE.md) - Main development guide
- [PATTERNS.md](./PATTERNS.md) - UI patterns & conventions
- `AGENTS.md` - Main agent configuration
