# Backend Skills

Daftar semua skills untuk Backend Agent (`@backend`).

---

## Skills List

| # | Skill | Description | Location |
|---|-------|-------------|----------|
| 1 | nestjs-module-scaffold | Module structure dengan Clean Architecture + DDD | [skills/nestjs-module-scaffold/SKILL.md](skills/nestjs-module-scaffold/SKILL.md) |
| 2 | ddd-boundary-rules | Batas antar domain sesuai prinsip DDD | [skills/ddd-boundary-rules/SKILL.md](skills/ddd-boundary-rules/SKILL.md) |
| 3 | prisma-conventions | Naming, struktur, dan best practices Prisma | [skills/prisma-conventions/SKILL.md](skills/prisma-conventions/SKILL.md) |
| 4 | repository-pattern | Repository Pattern untuk data access | [skills/repository-pattern/SKILL.md](skills/repository-pattern/SKILL.md) |
| 5 | controller-pattern | Controller REST API dengan NestJS | [skills/controller-pattern/SKILL.md](skills/controller-pattern/SKILL.md) |
| 6 | mapper-pattern | Mapping Domain ↔ Prisma ↔ DTO | [skills/mapper-pattern/SKILL.md](skills/mapper-pattern/SKILL.md) |
| 7 | validation-pattern | Input validation dengan class-validator | [skills/validation-pattern/SKILL.md](skills/validation-pattern/SKILL.md) |
| 8 | transaction-pattern | Database transactions dengan Prisma | [skills/transaction-pattern/SKILL.md](skills/transaction-pattern/SKILL.md) |
| 9 | exception-pattern | Error handling dengan NestJS exceptions | [skills/exception-pattern/SKILL.md](skills/exception-pattern/SKILL.md) |
| 10 | testing-pattern | Unit tests dan E2E tests dengan Jest | [skills/testing-pattern/SKILL.md](skills/testing-pattern/SKILL.md) |

---

## Quick Reference

### When to Use Each Skill

| Situation | Skill |
|-----------|-------|
| Buat module baru | nestjs-module-scaffold |
| Buat entity/repository | ddd-boundary-rules, repository-pattern |
| Edit Prisma schema | prisma-conventions |
| Buat controller | controller-pattern |
| Mapping data antar layer | mapper-pattern |
| Validasi input | validation-pattern |
| Operasi complex DB | transaction-pattern |
| Handle error | exception-pattern |
| Tulis tests | testing-pattern |

---

## Skill Usage

### Load Skill

```bash
# Saat agent memuat skill
Use the skill tool to load: nestjs-module-scaffold
```

### Apply Skill

```bash
# Agent akan mengikuti instruksi di SKILL.md
# dan menerapkan patterns ke code
```

---

## References

- [GUIDE.md](../GUIDE.md)
- [PATTERNS.md](../PATTERNS.md)
- [MCP.md](../MCP.md)
