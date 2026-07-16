---
description: Install all project dependencies
agent: build
---

# Install Dependencies

Run the following commands to install all project dependencies:

```bash
# Install root dependencies
pnpm install

# Verify installation
ls -la node_modules
```

After installation, verify that:
1. `node_modules` exists in root
2. `apps/backend/node_modules` exists
3. `apps/portal/node_modules` exists
4. `packages/shared/node_modules` exists

If any issues, run `pnpm install --force` to clean install.
