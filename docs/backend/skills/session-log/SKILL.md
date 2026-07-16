# session-log

## Tujuan

Auto-generate session log untuk context recovery dan progress tracking.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  SESSION LOG RULES (MANDATORY)                              │
├─────────────────────────────────────────────────────────────┤
│  1. Every 10 tool calls → check context > 60% → save       │
│  2. Every task completed → update session log               │
│  3. Before stopping → save ALL progress + summary           │
│  4. NEVER skip session logging                              │
│  5. ALWAYS use time-based file naming                       │
└─────────────────────────────────────────────────────────────┘
```

---

## File Location

```
session_logs/
├── backend/
│   └── YYYY-MM-DD_HH-MM.md
├── frontend/
│   └── YYYY-MM-DD_HH-MM.md
└── README.md
```

---

## Naming Convention

```
YYYY-MM-DD_HH-MM.md

Contoh:
2026-07-09_14-30.md
2026-07-09_15-45.md

With description (optional):
2026-07-09_14-30_supplier-crud.md
```

---

## Template

### Required Sections

````markdown
# Session Log - [Backend/Frontend] - YYYY-MM-DD HH:MM

## Phase

- **Current Phase**: Phase 1: MVP
- **Progress**: ~XX%

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
````

## Phase Status Check

```markdown
### MVP Checklist (Phase 1)

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
```

## Checkpoint

- Context usage: ~X%
- Last tool call: [nama tool]
- Timestamp: YYYY-MM-DDTHH:MM:SSZ

````

---

## Cara Menggunakan

### 1. Auto-Save (Mandatory)

```typescript
// Trigger: Every 10 tool calls
if (toolCallCount % 10 === 0) {
  if (contextUsage > 60) {
    await saveSessionLog();
  }
}
````

### 2. Task Completion (Mandatory)

```typescript
// Trigger: Task completed
if (taskCompleted) {
  await saveSessionLog();
}
```

### 3. Session End (Mandatory)

```typescript
// Trigger: Before stopping
await saveSessionLog();
await writeSummary();
```

---

## Output

### File Structure

```
session_logs/backend/2026-07-09_14-30.md
session_logs/backend/2026-07-09_15-45.md
session_logs/frontend/2026-07-09_14-30.md
```

### Content Example

```markdown
# Session Log - Backend - 2026-07-09 14:30

## Phase

- **Current Phase**: Phase 1: MVP
- **Progress**: ~40%

## Current Task

Implement supplier CRUD module

## Progress

- [x] Create supplier service
- [x] Create supplier controller
- [ ] Add validation
- [ ] Write tests

## Files Modified

- `apps/backend/src/modules/supplier/supplier.service.ts` - Created CRUD methods
- `apps/backend/src/modules/supplier/supplier.controller.ts` - Added REST endpoints

## Decisions Made

- Used Prisma for DB queries (consistent with existing modules)

## Blockers

- None

## Next Steps

1. Add validation
2. Write unit tests

## Checkpoint

- Context usage: ~30%
- Last tool call: edit
- Timestamp: 2026-07-09T14:30:00Z
```

---

## Checklist

- [ ] Read template: `session_logs/<role>/TEMPLATE.md`
- [ ] Create file with time-based naming
- [ ] Fill all required sections
- [ ] Add checkpoint with context %
- [ ] Save to correct location

---

## Anti-Patterns

```
❌ Skip session logging
   "I'll save it later..."

❌ Use descriptive naming only
   session_logs/backend/supplier-crud.md

✅ Use time-based naming
   session_logs/backend/2026-07-09_14-30.md

❌ Forget checkpoint section
   (missing context usage %)

✅ Always include checkpoint
   - Context usage: ~30%
   - Last tool call: edit
   - Timestamp: 2026-07-09T14:30:00Z
```

---

## References

- [session_logs/README.md](../../../../session_logs/README.md)
- [docs/AGENTS.md](../../../../AGENTS.md)
- [docs/backend/CONTEXT_RECOVERY.md](../../CONTEXT_RECOVERY.md)
- [docs/frontend/CONTEXT_RECOVERY.md](../../../frontend/CONTEXT_RECOVERY.md)
