# loading-pattern

## Tujuan

Menampilkan loading states yang baik untuk UX dengan skeleton, spinner, dan optimistic updates.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  LOADING PATTERN RULES                                      │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan skeleton untuk content loading                  │
│  2. Gunakan spinner untuk action loading                    │
│  3. Disable interactive elements saat loading               │
│  4. Tampilkan progress untuk long operations                │
│  5. Gunakan optimistic updates untuk UX yang baik           │
│  6. Jangan tampilkan spinner untuk operasi cepat            │
│  7. Berikan feedback visual yang jelas                      │
│  8. Test semua loading scenarios                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Loading Components

### Skeleton

```typescript
// components/ui/skeleton.tsx
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  );
}

export { Skeleton };
```

### Spinner

```typescript
// components/ui/spinner.tsx
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn(
        'animate-spin text-primary-600',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
```

### Loading Button

```typescript
// components/ui/button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'bg-transparent hover:bg-gray-100': variant === 'ghost',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="mr-2" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

---

## Page Loading Patterns

### Skeleton Page

```typescript
// components/batch/BatchListSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function BatchListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Loading Page

```typescript
// app/(authenticated)/batch/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BatchList } from '@/components/batch/BatchList';
import { BatchListSkeleton } from '@/components/batch/BatchListSkeleton';
import { useBatches } from '@/hooks/useBatches';

export default function BatchPage() {
  const { data, loading, error } = useBatches();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Batch Tracking</h1>
      
      {loading ? (
        <BatchListSkeleton />
      ) : error ? (
        <ErrorMessage error={error} />
      ) : (
        <BatchList batches={data || []} />
      )}
    </div>
  );
}
```

### Loading.tsx (Next.js)

```typescript
// app/(authenticated)/batch/loading.tsx
import { BatchListSkeleton } from '@/components/batch/BatchListSkeleton';

export default function BatchLoading() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Batch Tracking</h1>
      <BatchListSkeleton />
    </div>
  );
}
```

---

## Optimistic Updates

```typescript
// hooks/useBatchMutations.ts
'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Batch } from '@/types/api';

export function useBatchMutations() {
  const [optimisticBatches, setOptimisticBatches] = useState<Batch[]>([]);

  const addOptimistic = useCallback((batch: Batch) => {
    setOptimisticBatches((prev) => [batch, ...prev]);
  }, []);

  const removeOptimistic = useCallback((id: string) => {
    setOptimisticBatches((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const createBatch = useCallback(async (data: any) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticBatch: Batch = {
      id: tempId,
      ...data,
      status: 'ACTIVE',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOptimistic(optimisticBatch);

    try {
      const response = await api.post('/batches', data);
      removeOptimistic(tempId);
      return response;
    } catch (error) {
      removeOptimistic(tempId);
      throw error;
    }
  }, [addOptimistic, removeOptimistic]);

  const deleteBatch = useCallback(async (id: string) => {
    const batch = optimisticBatches.find((b) => b.id === id);
    removeOptimistic(id);

    try {
      await api.delete(`/batches/${id}`);
    } catch (error) {
      if (batch) {
        setOptimisticBatches((prev) => [batch, ...prev]);
      }
      throw error;
    }
  }, [optimisticBatches, removeOptimistic]);

  return {
    optimisticBatches,
    createBatch,
    deleteBatch,
  };
}
```

---

## Checklist

- [ ] Setup Skeleton components
- [ ] Setup Spinner components
- [ ] Gunakan skeleton untuk page loading
- [ ] Disable interactive elements saat loading
- [ ] Implement optimistic updates
- [ ] Berikan feedback visual yang jelas
- [ ] Test semua loading scenarios

---

## Anti-Patterns

```
❌ No loading state
export function BatchList() {
  const { data } = useBatches();
  return <div>{data?.map(...)}</div>;
}

✅ Add loading state
export function BatchList() {
  const { data, loading } = useBatches();
  
  if (loading) return <BatchListSkeleton />;
  
  return <div>{data?.map(...)}</div>;
}

❌ Show spinner for everything
{loading && <Spinner />}

✅ Use skeleton for content
{loading && <BatchListSkeleton />}

❌ No optimistic updates
const deleteBatch = async (id) => {
  await api.delete(`/batches/${id}`);
  refetch();
};

✅ Optimistic updates
const deleteBatch = async (id) => {
  removeOptimistic(id);
  try {
    await api.delete(`/batches/${id}`);
  } catch (error) {
    rollbackOptimistic();
    throw error;
  }
};
```

---

## References

- [React Suspense](https://react.dev/reference/react/Suspense)
- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Optimistic Updates](https://react.dev/learn/optimizing-re-renders#defering-re-rendering-with-start-transition)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
