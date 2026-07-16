# error-handling-pattern

## Tujuan

Menangani error secara global dan component-level dengan Graceful Degradation.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  ERROR HANDLING PATTERN RULES                               │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan Error Boundary untuk component errors           │
│  2. Handle API errors di hook atau service                  │
│  3. Tampilkan error messages yang user-friendly             │
│  4. Berikan retry option untuk recoverable errors           │
│  5. Log errors untuk debugging                              │
│  6. Graceful degradation untuk non-critical failures        │
│  7. Test semua error scenarios                              │
│  8. Jangan expose internal errors ke user                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Boundary

### Global Error Boundary

```typescript
// components/error/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Page Error Boundary

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          We encountered an unexpected error. Please try again.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

---

## Error Handling in Hooks

```typescript
// hooks/useApi.ts
'use client';

import { useState, useCallback } from 'react';
import { ApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });

    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const error = err instanceof ApiError
        ? err
        : new ApiError('An unexpected error occurred', 500);
      
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
```

---

## User-Friendly Error Messages

```typescript
// lib/errors.ts
import { ApiError } from '@/lib/api';

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Please log in to continue.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The resource you requested was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Something went wrong on our end. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
```

### Usage in Components

```typescript
'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';

export function BatchForm() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setError(null);
      await api.post('/batches', data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      {error && <ErrorMessage message={error} />}
      {/* form content */}
    </div>
  );
}
```

---

## Retry Logic

```typescript
// lib/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
}

// Usage
const data = await withRetry(() => api.get('/batches'), {
  maxRetries: 3,
  delay: 1000,
});
```

---

## Checklist

- [ ] Setup Error Boundary
- [ ] Handle API errors di hooks
- [ ] Tampilkan user-friendly messages
- [ ] Berikan retry option
- [ ] Log errors untuk debugging
- [ ] Graceful degradation
- [ ] Test semua error scenarios

---

## Anti-Patterns

```
❌ No error handling
const data = await api.get('/batches');

✅ Handle errors
try {
  const data = await api.get('/batches');
} catch (error) {
  setError(getErrorMessage(error));
}

❌ Expose internal errors
<p>Error: {error.message}</p>

✅ User-friendly messages
<p>Something went wrong. Please try again.</p>

❌ No retry for transient errors
try {
  await api.post('/batches', data);
} catch (error) {
  setError(error.message);
}

✅ Retry for transient errors
try {
  await withRetry(() => api.post('/batches', data));
} catch (error) {
  setError('Failed after multiple attempts. Please try again later.');
}
```

---

## References

- [React Error Handling](https://react.dev/reference/react/Component#catching-rendering-errors-with-error-boundaries)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Error Boundary Pattern](https://react.dev/learn/managing-state#reducing-and-resetting-state)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
