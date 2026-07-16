# Frontend Patterns & Conventions

## Code Style

### 1. Component Structure

```
src/
├── components/
│   ├── ui/                    # Basic UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── layout/                # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── features/              # Feature-specific components
│       ├── batch/
│       │   └── BatchCard.tsx
│       └── supplier/
│           └── SupplierList.tsx
```

### 2. Naming Convention

| Item | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `ProductCard` |
| Page | PascalCase + Page | `BatchPage` |
| Hook | camelCase + use | `useAuth` |
| Utility | camelCase | `formatCurrency` |
| File | PascalCase.tsx | `ProductCard.tsx` |

### 3. Component Pattern

```tsx
// src/components/features/batch/BatchCard.tsx

import { formatDate } from '@/lib/utils';
import { Batch } from '@sigizi/shared';

interface BatchCardProps {
  batch: Batch;
}

export function BatchCard({ batch }: BatchCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-800">
        {batch.batchNumber}
      </h3>
      <p className="text-sm text-gray-500">
        {formatDate(batch.date)}
      </p>
      <p className="text-gray-700 mt-2">
        {batch.menu}
      </p>
    </div>
  );
}
```

### 4. Page Pattern (CSR)

```tsx
// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getBatches } from '@/lib/api';
import { BatchCard } from '@/components/features/batch/BatchCard';

export default function DashboardPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBatches() {
      try {
        const token = localStorage.getItem('token');
        const response = await getBatches(token!);
        setBatches(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadBatches();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {batches.map((batch) => (
          <BatchCard key={batch.id} batch={batch} />
        ))}
      </div>
    </div>
  );
}
```

### 5. Page Pattern (SSR)

```tsx
// src/app/batch/page.tsx

import { getBatchByNumber } from '@/lib/api';
import { BatchDetails } from '@/components/features/batch/BatchDetails';

interface BatchPageProps {
  searchParams: { number?: string };
}

export default async function BatchPage({ searchParams }: BatchPageProps) {
  const { number } = searchParams;

  if (!number) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1>Masukkan Nomor Batch</h1>
      </div>
    );
  }

  try {
    const response = await getBatchByNumber(number);
    return <BatchDetails batch={response.data} />;
  } catch (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1>Batch Tidak Ditemukan</h1>
      </div>
    );
  }
}
```

---

## State Management

### Local State (useState)

```tsx
const [count, setCount] = useState(0);
const [user, setUser] = useState<User | null>(null);
```

### Context (if needed)

```tsx
// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check stored token
    const token = localStorage.getItem('token');
    if (token) {
      // Validate and set user
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

## Error Handling

```tsx
// 1. Try-catch in components
try {
  const response = await apiCall();
  setData(response.data);
} catch (error) {
  setError(error.message);
}

// 2. Error boundary
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

---

## API Integration

### Using API Client

```tsx
import { 
  getBatchByNumber,
  getSuppliers,
  createComplaint 
} from '@/lib/api';

// GET request
const batch = await getBatchByNumber('BATCH-20260709-001');

// POST request
const complaint = await createComplaint({
  reportKey: 'ABC123',
  description: 'Nasi basi',
});
```

### With Authentication

```tsx
// Get token from storage
const token = localStorage.getItem('token');

// Pass to API
const response = await getBatches(token);
```

---

## Shared Types Usage

```tsx
// Import from shared package
import { Batch, Supplier, Role } from '@sigizi/shared';

// Use in components
interface BatchCardProps {
  batch: Batch;
}

const batch: Batch = {
  id: '123',
  batchNumber: 'BATCH-20260709-001',
  // ...
};
```

---

## Utility Functions

```tsx
import { cn, formatCurrency, formatDate } from '@/lib/utils';

// Merge classes
<button className={cn(
  'px-4 py-2 rounded',
  isActive ? 'bg-green-600' : 'bg-gray-200'
)}>

// Format currency
<p>{formatCurrency(12000)}</p> // Rp 12.000

// Format date
<p>{formatDate('2026-07-09')}</p> // Rabu, 9 Juli 2026
```

---

## Git Commit Convention

```bash
[frontend] create batch tracking page
[frontend] add responsive navbar
[frontend] fix mobile layout issue
```

---

## See Also

- [GUIDE.md](./GUIDE.md) - Main development guide
- [CONTEXT_RECOVERY.md](./CONTEXT_RECOVERY.md) - Context recovery protocol
