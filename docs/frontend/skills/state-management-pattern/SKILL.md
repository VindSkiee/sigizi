# state-management-pattern

## Tujuan

Mengelola state secara efektif menggunakan React hooks dan context.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  STATE MANAGEMENT PATTERN RULES                             │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan local state untuk UI state                      │
│  2. Gunakan context untuk global state                      │
│  3. Gunakan URL state untuk filter/sort/pagination          │
│  4. Jangan overcomplicate - useState cukup untuk banyak kasus│
│  5. Pisahkan state logic ke custom hooks                    │
│  6. Gunakan useReducer untuk complex state                  │
│  7. Avoid prop drilling                                    │
│  8. Test semua state logic                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## State Types

### 1. Local State (UI State)

```typescript
'use client';

import { useState } from 'react';

export function BatchFilters() {
  // Local state untuk UI
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search batches..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

### 2. URL State (Persistent State)

```typescript
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useBatchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = {
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const setFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      const params = new URLSearchParams();
      
      Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`);
    },
    [filters, router]
  );

  return { filters, setFilters };
}

// Usage
export function BatchPage() {
  const { filters, setFilters } = useBatchFilters();
  
  return (
    <div>
      <Input
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
      />
      <BatchList filters={filters} />
    </div>
  );
}
```

### 3. Server State (API Data)

```typescript
// hooks/useBatches.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export function useBatches(filters: Record<string, any> = {}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/batches', filters);
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const mutate = useCallback(async () => {
    await fetchBatches();
  }, [fetchBatches]);

  return { data, loading, error, mutate };
}
```

### 4. Global State (Context)

```typescript
// context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    setUser(response.user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

## Complex State with useReducer

```typescript
// hooks/useBatchManager.ts
'use client';

import { useReducer, useCallback } from 'react';

interface Batch {
  id: string;
  batchNumber: string;
  items: BatchItem[];
}

interface BatchItem {
  id: string;
  itemId: string;
  quantity: number;
}

interface State {
  batches: Batch[];
  selectedBatch: Batch | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Batch[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SELECT_BATCH'; payload: Batch | null }
  | { type: 'ADD_BATCH'; payload: Batch }
  | { type: 'UPDATE_BATCH'; payload: Batch }
  | { type: 'DELETE_BATCH'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, batches: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SELECT_BATCH':
      return { ...state, selectedBatch: action.payload };
    case 'ADD_BATCH':
      return { ...state, batches: [...state.batches, action.payload] };
    case 'UPDATE_BATCH':
      return {
        ...state,
        batches: state.batches.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
    case 'DELETE_BATCH':
      return {
        ...state,
        batches: state.batches.filter((b) => b.id !== action.payload),
        selectedBatch:
          state.selectedBatch?.id === action.payload ? null : state.selectedBatch,
      };
    default:
      return state;
  }
}

export function useBatchManager() {
  const [state, dispatch] = useReducer(reducer, {
    batches: [],
    selectedBatch: null,
    loading: false,
    error: null,
  });

  const fetchBatches = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await api.get('/batches');
      dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: 'Failed to fetch batches' });
    }
  }, []);

  const addBatch = useCallback(async (batch: Omit<Batch, 'id'>) => {
    const response = await api.post('/batches', batch);
    dispatch({ type: 'ADD_BATCH', payload: response });
  }, []);

  const updateBatch = useCallback(async (batch: Batch) => {
    const response = await api.put(`/batches/${batch.id}`, batch);
    dispatch({ type: 'UPDATE_BATCH', payload: response });
  }, []);

  const deleteBatch = useCallback(async (id: string) => {
    await api.delete(`/batches/${id}`);
    dispatch({ type: 'DELETE_BATCH', payload: id });
  }, []);

  const selectBatch = useCallback((batch: Batch | null) => {
    dispatch({ type: 'SELECT_BATCH', payload: batch });
  }, []);

  return {
    ...state,
    fetchBatches,
    addBatch,
    updateBatch,
    deleteBatch,
    selectBatch,
  };
}
```

---

## Checklist

- [ ] Gunakan local state untuk UI state
- [ ] Gunakan URL state untuk filter/sort/pagination
- [ ] Gunakan context untuk global state
- [ ] Pisahkan state logic ke custom hooks
- [ ] Gunakan useReducer untuk complex state
- [ ] Avoid prop drilling
- [ ] Test semua state logic

---

## Anti-Patterns

```
❌ Prop drilling
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Sidebar user={user} />;
}

function Sidebar({ user }) {
  return <UserProfile user={user} />;
}

✅ Context
function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

function Sidebar() {
  const { user } = useAuth();
  return <UserProfile user={user} />;
}

❌ Overusing context for everything
const ThemeContext = createContext('light');
const SidebarContext = createContext(false);
const ModalContext = createContext(null);

✅ Keep it simple
const [theme, setTheme] = useState('light');
const [sidebarOpen, setSidebarOpen] = useState(false);
const [modal, setModal] = useState(null);

❌ Storing server state in context
const DataContext = createContext([]);

✅ Use custom hooks for server state
function useData() {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.get('/data').then(setData);
  }, []);
  return data;
}
```

---

## References

- [React State Management](https://react.dev/learn/managing-state)
- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Jotai](https://jotai.org/)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
