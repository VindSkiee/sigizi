# Session Logs

Direktori ini menyimpan log session untuk context recovery.

## Struktur

```
session_logs/
├── backend/           # Backend agent session logs
│   └── YYYY-MM-DD_HH-MM.md
├── frontend/          # Frontend agent session logs
│   └── YYYY-MM-DD_HH-MM.md
└── README.md          # File ini
```

## Naming Convention

```
YYYY-MM-DD_HH-MM.md

Contoh:
2026-07-09_14-30.md
2026-07-09_15-45.md
```

## Isi Session Log

Setiap session log minimal harus berisi:

```markdown
# Session Log - [Backend/Frontend] - [YYYY-MM-DD HH:MM]

## Current Task
[Deskripsi task]

## Progress
- [ ] Task 1
- [x] Task 2 (selesai)

## Files Modified
- `path/to/file.ts` - Deskripsi

## Decisions Made
- Keputusan: Alasan

## Blockers
- Blocker: Deskripsi

## Next Steps
1. Step selanjutnya

## Checkpoint
- Context usage: ~X%
- Last tool call: [tool]
- Timestamp: [waktu]
```

## Kapan Harus Save?

```
1. Context > 60% digunakan
2. Setelah 15 tool calls
3. Setelah selesai 1 task besar
4. Sebelum mulai task baru
5. Ketika mulai "lupa" konteks
```

## Cara Recovery

```bash
# 1. Baca session log terakhir
cat session_logs/backend/*.md | tail -100

# 2. Baca context recovery guide
cat docs/backend/CONTEXT_RECOVERY.md

# 3. Verifikasi file
ls -la apps/backend/src/

# 4. Resume dari checkpoint
```

## Rules

1. **Jangan hapus** session log lama (untuk history)
2. **Selalu update** checkpoint di akhir session
3. **Gunakan naming** yang konsisten
4. **Isi minimal** semua field yang required
