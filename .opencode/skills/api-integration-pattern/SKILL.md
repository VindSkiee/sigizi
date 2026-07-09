# api-integration-pattern

## Tujuan

Integrasi API yang konsisten, handle loading, error, dan auth dengan benar.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  API INTEGRATION PATTERN RULES                              │
├─────────────────────────────────────────────────────────────┤
│  1. Buat API client terpusat (lib/api.ts)                   │
│  2. Gunakan TypeScript interfaces untuk response            │
│  3. Handle loading states                                    │
│  4. Handle error dengan proper messages                     │
│  5. Implement auth token refresh                            │
│  6. Gunakan retry logic untuk transient errors              │
│  7. Cache data yang tidak sering berubah                    │
│  8. Test semua API integrations                             │
└─────────────────────────────────────────────────────────────┘
```

---

## API Client Setup

### Base API Client

```typescript
// lib/api.ts
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new ApiError(error.message, response.status, error);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers = await this.getHeaders();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient(API_BASE_URL);

// Custom error class
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
```

---

## Types

### API Types

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Batch types
export interface Batch {
  id: string;
  batchNumber: string;
  date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  sppg: Sppg;
  items: BatchItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BatchItem {
  id: string;
  itemId: string;
  item: SupplierItem;
  quantity: number;
  unitPrice: number;
}

export interface Sppg {
  id: string;
  name: string;
  address: string;
}

export interface SupplierItem {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
}
```

---

## Hooks

### useApi Hook

```typescript
// hooks/useApi.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { immediate = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError('An error occurred', 500);
        setError(apiError);
        onError?.(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}
```

### useBatches Hook

```typescript
// hooks/useBatches.ts
'use client';

import { useApi } from './useApi';
import { api } from '@/lib/api';
import { Batch, PaginatedResponse } from '@/types/api';

interface UseBatchesOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useBatches(options: UseBatchesOptions = {}) {
  const fetchBatches = useCallback(
    () => api.get<PaginatedResponse<Batch>>('/batches', options),
    [options.page, options.limit, options.search, options.status]
  );

  return useApi(fetchBatches, { immediate: true });
}

export function useBatch(id: string) {
  return useApi(
    () => api.get<Batch>(`/batches/${id}`),
    { immediate: true }
  );
}
```

---

## Error Handling

### Error Component

```typescript
// components/ui/ErrorMessage.tsx
import { ApiError } from '@/lib/api';
import { Button } from './button';

interface ErrorMessageProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-red-50 p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error: {error.message}
          </h3>
          {error.status && (
            <p className="mt-1 text-sm text-red-700">
              Status: {error.status}
            </p>
          )}
        </div>
        {onRetry && (
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={onRetry}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Usage in Page

```typescript
// app/(authenticated)/batch/page.tsx
'use client';

import { useBatches } from '@/hooks/useBatches';
import { BatchList } from '@/components/batch/BatchList';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';

export default function BatchPage() {
  const { data, loading, error, execute } = useBatches();

  if (error) {
    return <ErrorMessage error={error} onRetry={execute} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Batch Tracking</h1>
        <Button onClick={() => {/* navigate to create */}}>
          Create Batch
        </Button>
      </div>
      
      <BatchList
        batches={data?.data || []}
        loading={loading}
      />
    </div>
  );
}
```

---

## Checklist

- [ ] Buat API client terpusat
- [ ] Define TypeScript interfaces
- [ ] Handle loading states
- [ ] Handle error dengan proper messages
- [ ] Implement auth token
- [ ] Gunakan retry logic
- [ ] Cache data yang tidak sering berubah
- [ ] Test semua API integrations

---

## Anti-Patterns

```
❌ Fetch di component
export function BatchList() {
  const [batches, setBatches] = useState([]);
  
  useEffect(() => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(setBatches);
  }, []);
  
  return <div>{batches.map(...)}</div>;
}

✅ Gunakan custom hook
export function BatchList() {
  const { data, loading, error } = useBatches();
  
  return <div>{data?.map(...)}</div>;
}

❌ No error handling
fetch('/api/batches').then(res => res.json());

✅ Handle errors
try {
  const data = await api.get('/batches');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.message, error.status);
  }
}

❌ Hardcoded API URL
fetch('http://localhost:3001/api/batches');

✅ Use API client
import { api } from '@/lib/api';
const data = await api.get('/batches');
```

---

## References

- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching)
- [SWR](https://swr.vercel.app/)
- [React Query](https://tanstack.com/query)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
