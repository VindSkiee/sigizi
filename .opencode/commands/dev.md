---
description: Start all development servers
agent: build
---

# Start Development

Run the following commands to start all development servers:

```bash
# Start backend server (port 3001)
cd apps/backend
pnpm dev &

# Start frontend server (port 3000)
cd apps/portal
pnpm dev &

# Or use Docker Compose
docker-compose up
```

Verify servers are running:
- Backend: http://localhost:3001/api/health
- Frontend: http://localhost:3000
- API Docs: http://localhost:3001/docs
