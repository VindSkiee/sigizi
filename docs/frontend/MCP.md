# Frontend MCP Servers

## Wajib

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
# Query Next.js docs
"context7 next.js app router"

# Query React docs
"context7 react hooks"

# Query Tailwind docs
"context7 tailwindcss grid"
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

### Playwright MCP

**Purpose:** E2E testing Next.js (SSR & CSR).

**Config:**
```json
{
  "name": "playwright",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-playwright"]
}
```

**Capabilities:**
- Browser automation
- E2E testing
- Screenshot capture
- Network interception

**When to use:**
- Testing SSR pages
- Testing CSR interactions
- Visual regression testing

---

## Opsional

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
- Reading backend API docs
- Fetching external documentation
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
- UI/UX design decisions

---

## MCP Priority

```
1. Context7 MCP (wajib untuk library docs)
2. Git MCP (wajib untuk version control)
3. Memory MCP (wajib untuk context persistence)
4. Filesystem MCP (wajib untuk file operations)
5. GitHub MCP (wajib untuk remote repo)
6. Playwright MCP (wajib untuk E2E testing)
```

---

## See Also

- [GUIDE.md](./GUIDE.md) - Main development guide
- [SKILLS.md](./SKILLS.md) - Frontend skills
- [CONTEXT_RECOVERY.md](./CONTEXT_RECOVERY.md) - Context recovery
