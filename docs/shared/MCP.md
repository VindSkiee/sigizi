# Shared MCP Servers

## Servers yang Digunakan Semua Role

---

### Git MCP

**Purpose:** Operasi Git pada repository lokal.

**Config:**
```json
{
  "name": "git",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-git"]
}
```

**Use Cases:**
- `git status` - Cek status repository
- `git diff` - Lihat perubahan
- `git log` - Lihat history
- `git show` - Lihat commit detail

---

### GitHub MCP

**Purpose:** Repository, Pull Request, Issues, Code Search, CI.

**Config:**
```json
{
  "name": "github",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
  }
}
```

**Use Cases:**
- Create/manage PRs
- Track issues
- Search code
- Check CI status

---

### Filesystem MCP

**Purpose:** Operasi file lokal secara aman.

**Config:**
```json
{
  "name": "filesystem",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "${WORKSPACE_ROOT}"]
}
```

**Use Cases:**
- Read/write files
- List directories
- Search files

---

### Context7 MCP

**Purpose:** Up-to-date library documentation.

**Config:**
```json
{
  "name": "context7",
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp"]
}
```

**Use Cases:**
- Lookup library docs (NestJS, Next.js, Prisma, React, Tailwind)
- Get API reference
- Find code examples

**Query Examples:**
```
# Backend
"context7 nestjs controller"
"context7 prisma migration"
"context7 passport jwt"

# Frontend
"context7 next.js app router"
"context7 react hooks"
"context7 tailwindcss flexbox"
```

---

### Memory MCP

**Purpose:** Menyimpan konteks project jangka panjang.

**Config:**
```json
{
  "name": "memory",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"]
}
```

**Use Cases:**
- Store project decisions
- Recall past context
- Maintain consistency across sessions

---

### Fetch MCP

**Purpose:** Membaca dokumentasi API eksternal.

**Config:**
```json
{
  "name": "fetch",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-fetch"]
}
```

**Use Cases:**
- Read external API docs
- Fetch documentation
- Validate API responses

---

### Sequential Thinking MCP

**Purpose:** Membantu menyelesaikan task kompleks secara bertahap.

**Config:**
```json
{
  "name": "sequential-thinking",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
}
```

**Use Cases:**
- Complex problem solving
- Multi-step tasks
- Algorithm design
- Architecture decisions

---

## MCP Matrix by Role

| MCP Server | @backend | @frontend | @shared |
|------------|:--------:|:---------:|:-------:|
| Git | ✅ | ✅ | ✅ |
| GitHub | ✅ | ✅ | ✅ |
| Filesystem | ✅ | ✅ | ✅ |
| Context7 | ✅ | ✅ | ✅ |
| Memory | ✅ | ✅ | ✅ |
| Fetch | ✅ | ✅ | ✅ |
| Sequential Thinking | ✅ | ✅ | ✅ |
| PostgreSQL | ✅ | ❌ | ❌ |
| Playwright | ❌ | ✅ | ❌ |
| Redis | ✅ | ❌ | ❌ |

---

## Quick Reference

```bash
# Backend Agent
cat docs/backend/MCP.md

# Frontend Agent
cat docs/frontend/MCP.md

# All Agents
cat docs/shared/MCP.md
```

---

## See Also

- [backend/MCP.md](../backend/MCP.md) - Backend-specific MCP
- [frontend/MCP.md](../frontend/MCP.md) - Frontend-specific MCP
- [backend/SKILLS.md](../backend/SKILLS.md) - Backend skills
- [frontend/SKILLS.md](../frontend/SKILLS.md) - Frontend skills
