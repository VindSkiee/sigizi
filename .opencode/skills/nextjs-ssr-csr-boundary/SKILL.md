# nextjs-ssr-csr-boundary

## Tujuan

Memahami kapan menggunakan SSR vs CSR di Next.js dan bagaimana mengimplementasikannya dengan benar.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  SSR/CSR BOUNDARY RULES                                     │
├─────────────────────────────────────────────────────────────┤
│  1. Default gunakan CSR untuk semua halaman                 │
│  2. Gunakan SSR hanya untuk SEO-critical pages              │
│  3. Batch tracking page (/batch) selalu CSR                 │
│  4. Gunakan 'use client' untuk komponen interaktif          │
│  5. Jangan mix SSR dan CSR di halaman yang sama             │
│  6. Gunakan Suspense untuk loading states                   │
│  7. Handle error dengan Error Boundary                      │
│  8. Test semua edge cases di kedua mode                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│                    WHEN TO USE SSR?                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Apakah halaman ini memerlukan SEO?                         │
│  ├── YA → Gunakan SSR                                      │
│  │   ├── Landing page                                       │
│  │   ├── Public profile                                     │
│  │   └── Blog posts                                         │
│  │                                                          │
│  └── TIDAK → Gunakan CSR                                    │
│      ├── Dashboard                                           │
│      ├── Admin panel                                         │
│      ├── Settings page                                       │
│      └── Batch tracking (/batch) ← SIGIZI                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## CSR Implementation (Default)

### Basic CSR Page

```typescript
// app/(authenticated)/batch/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BatchList } from '@/components/batch/BatchList';
import { BatchFilters } from '@/components/batch/BatchFilters';
import { useBatches } from '@/hooks/useBatches';

export default function BatchPage() {
  const [filters, setFilters] = useState({});
  const { batches, loading, error } = useBatches(filters);

  if (error) {
    return <ErrorDisplay message={error.message} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Batch Tracking</h1>
      
      <BatchFilters onChange={setFilters} />
      
      {loading ? (
        <BatchListSkeleton />
      ) : (
        <BatchList batches={batches} />
      )}
    </div>
  );
}
```

### CSR with API Integration

```typescript
// hooks/useBatches.ts
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Batch {
  id: string;
  batchNumber: string;
  date: string;
  status: string;
  sppg: {
    name: string;
  };
}

export function useBatches(filters: Record<string, any> = {}) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const data = await api.get('/batches', { params: filters });
        setBatches(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [JSON.stringify(filters)]);

  return { batches, loading, error };
}
```

---

## SSR Implementation (When Needed)

### Basic SSR Page

```typescript
// app/(public)/batch/[id]/page.tsx
import { Metadata } from 'next';
import { BatchDetail } from '@/components/batch/BatchDetail';
import { api } from '@/lib/api';

// Generate metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  const batch = await api.get(`/batches/${params.id}`);
  
  return {
    title: `Batch ${batch.batchNumber} - SIGIZI`,
    description: `Track batch ${batch.batchNumber} status and details`,
  };
}

// Server component
export default async function BatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const batch = await api.get(`/batches/${params.id}`);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Batch {batch.batchNumber}
      </h1>
      <BatchDetail batch={batch} />
    </div>
  );
}
```

### SSR with Streaming

```typescript
// app/(public)/batch/[id]/page.tsx
import { Suspense } from 'react';
import { BatchDetail } from '@/components/batch/BatchDetail';
import { BatchDetailSkeleton } from '@/components/batch/BatchDetailSkeleton';

export default async function BatchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Batch Details</h1>
      
      <Suspense fallback={<BatchDetailSkeleton />}>
        <BatchDetailWrapper id={params.id} />
      </Suspense>
    </div>
  );
}

async function BatchDetailWrapper({ id }: { id: string }) {
  const batch = await api.get(`/batches/${id}`);
  return <BatchDetail batch={batch} />;
}
```

---

## Hybrid Approach

### SSR Layout + CSR Children

```typescript
// app/(authenticated)/layout.tsx
import { Metadata } from 'next';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

// This layout is SSR
export const metadata: Metadata = {
  title: 'SIGIZI Dashboard',
  description: 'Government Supply Chain Management',
};

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children} {/* Children are CSR */}
        </main>
      </div>
    </div>
  );
}
```

### SSR Wrapper + CSR Content

```typescript
// app/(authenticated)/batch/page.tsx
import { Metadata } from 'next';
import { BatchPageClient } from './BatchPageClient';

// SSR metadata
export const metadata: Metadata = {
  title: 'Batch Tracking - SIGIZI',
  description: 'Track and manage supply batches',
};

// Server component wrapper
export default function BatchPage() {
  return <BatchPageClient />;
}

// CSR client component
// app/(authenticated)/batch/BatchPageClient.tsx
'use client';

import { useState } from 'react';
import { BatchList } from '@/components/batch/BatchList';
import { useBatches } from '@/hooks/useBatches';

export function BatchPageClient() {
  const [filters, setFilters] = useState({});
  const { batches, loading, error } = useBatches(filters);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Batch Tracking</h1>
      <BatchList batches={batches} loading={loading} error={error} />
    </div>
  );
}
```

---

## Loading States

### CSR Loading

```typescript
// components/batch/BatchList.tsx
'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function BatchListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
```

### SSR Loading with Suspense

```typescript
// app/(authenticated)/batch/loading.tsx
export default function BatchLoading() {
  return (
    <div className="container mx-auto p-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Checklist

- [ ] Tentukan SSR vs CSR berdasarkan kebutuhan SEO
- [ ] Gunakan 'use client' untuk komponen interaktif
- [ ] Implement loading states untuk kedua mode
- [ ] Handle error dengan Error Boundary
- [ ] Test semua edge cases di kedua mode
- [ ] Optimalkan performance dengan code splitting
- [ ] Gunakan Suspense untuk streaming (SSR)

---

## Anti-Patterns

```
❌ Mix SSR dan CSR di halaman yang sama
// This is wrong!
export default async function Page() {
  const data = await fetchData(); // SSR
  return <ClientComponent data={data} />; // CSR
}

✅ Separate SSR and CSR
// Server component wrapper
export default async function Page() {
  return <ClientComponent />;
}

// Client component
'use client';
export function ClientComponent() {
  // Handle data fetching client-side
}

❌ Use useEffect for SEO data
'use client';
export function Page() {
  useEffect(() => {
    // SEO data fetched here, but not visible to crawlers
  }, []);
}

✅ Use SSR for SEO data
export default async function Page() {
  const data = await fetchData(); // Visible to crawlers
  return <div>{data.title}</div>;
}
```

---

## References

- [Next.js Rendering](https://nextjs.org/docs/basic-features/rendering)
- [Server Components](https://nextjs.org/docs/getting-started/react-essentials)
- [Client Components](https://nextjs.org/docs/getting-started/react-essentials#client-components)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
