# Backend MCP Servers

## Wajib

### PostgreSQL MCP (read-only)

**Purpose:** Inspect schema, query, migration review, EXPLAIN analysis.

**Config:**
```json
{
  "name": "postgresql",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres", "${DATABASE_URL}"]
}
```

**Capabilities:**
- Schema inspection
- Query analysis
- Migration review
- EXPLAIN analysis

**Restrictions:**
```
❌ NO INSERT
❌ NO UPDATE
❌ NO DELETE
❌ NO DROP
❌ NO ALTER

✅ SELECT
✅ EXPLAIN
✅ Schema inspection
```

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

**Capabilities:**
- `git status`
- `git diff`
- `git log`
- `git show`
- `git blame`

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

**Capabilities:**
- Repository management
- Pull request operations
- Issue tracking
- Code search
- CI/CD status

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

**Capabilities:**
- Read files
- Write files
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

**Capabilities:**
- Library documentation lookup
- API reference
- Code examples
- Version-specific docs

**Usage:**
```
# Query NestJS docs
"context7 nestjs controller"

# Query Prisma docs
"context7 prisma migration"

# Query specific version
"context7 nestjs@10 controller"
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

**Capabilities:**
- Store project context
- Recall past decisions
- Maintain consistency

---

## Opsional

### Redis MCP

**Purpose:** Debug BullMQ, cache, TTL, queue.

**Config:**
```json
{
  "name": "redis",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-redis", "${REDIS_URL}"]
}
```

**When to use:**
- Debugging queue jobs
- Checking cache TTL
- Monitoring BullMQ

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

**When to use:**
- Reading external API docs
- Fetching documentation
- Validating API responses

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

**When to use:**
- Complex problem solving
- Multi-step tasks
- Algorithm design

---

## MCP Priority

```
1. PostgreSQL MCP (wajib untuk DB operations)
2. Context7 MCP (wajib untuk library docs)
3. Git MCP (wajib untuk version control)
4. Memory MCP (wajib untuk context persistence)
5. Filesystem MCP (wajib untuk file operations)
6. GitHub MCP (wajib untuk remote repo)
```

---

## See Also

- [GUIDE.md](./GUIDE.md) - Main development guide
- [SKILLS.md](./SKILLS.md) - Backend skills
- [CONTEXT_RECOVERY.md](./CONTEXT_RECOVERY.md) - Context recovery
