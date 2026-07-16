# nextjs-page-pattern

## Tujuan

Struktur halaman Next.js yang konsisten dan terorganisir.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  NEXTJS PAGE PATTERN RULES                                  │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan App Router (app/)                               │
│  2. Group routes dengan route groups (authenticated)        │
│  3. Buat layout untuk shared UI                             │
│  4. Pisahkan server dan client components                   │
│  5. Gunakan loading.tsx untuk loading states                │
│  6. Gunakan error.tsx untuk error handling                  │
│  7. Gunakan not-found.tsx untuk 404 pages                   │
│  8. Export metadata untuk SEO                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
│
├── (authenticated)/
│   ├── layout.tsx                    # Sidebar + Header
│   ├── dashboard/
│   │   ├── page.tsx                  # Dashboard page
│   │   └── loading.tsx               # Dashboard loading
│   ├── batch/
│   │   ├── page.tsx                  # Batch list (CSR)
│   │   ├── loading.tsx               # Batch loading
│   │   ├── [id]/
│   │   │   ├── page.tsx              # Batch detail
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── create/
│   │       └── page.tsx              # Create batch
│   ├── supplier/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── sppg/
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
│
├── (public)/
│   ├── layout.tsx                    # Public layout
│   ├── page.tsx                      # Landing page (SSR)
│   └── batch/
│       └── [id]/
│           └── page.tsx              # Public batch tracking (SSR)
│
├── layout.tsx                        # Root layout
├── loading.tsx                       # Root loading
├── error.tsx                         # Root error
├── not-found.tsx                     # 404 page
└── globals.css
```

---

## Page Templates

### Basic Page

```typescript
// app/(authenticated)/dashboard/page.tsx
import { Metadata } from 'next';
import { DashboardContent } from './DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard - SIGIZI',
  description: 'SIGIZI Dashboard',
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardContent />
    </div>
  );
}

// app/(authenticated)/dashboard/DashboardContent.tsx
'use client';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export function DashboardContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard title="Total Batches" value="128" />
      <StatsCard title="Active Suppliers" value="24" />
      <StatsCard title="SPPGs" value="12" />
      <StatsCard title="Beneficiaries" value="1,024" />
      
      <div className="col-span-full">
        <RecentActivity />
      </div>
    </div>
  );
}
```

### CRUD Page

```typescript
// app/(authenticated)/supplier/page.tsx
import { Metadata } from 'next';
import { SupplierTable } from '@/components/supplier/SupplierTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Suppliers - SIGIZI',
  description: 'Manage suppliers',
};

export default function SupplierPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Link href="/supplier/create">
          <Button>Add Supplier</Button>
        </Link>
      </div>
      
      <SupplierTable />
    </div>
  );
}
```

### Detail Page

```typescript
// app/(authenticated)/supplier/[id]/page.tsx
import { Metadata } from 'next';
import { SupplierDetail } from '@/components/supplier/SupplierDetail';
import { SupplierActions } from '@/components/supplier/SupplierActions';

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  // Fetch supplier data for metadata
  const supplier = await fetch(`${API_URL}/suppliers/${params.id}`);
  const data = await supplier.json();
  
  return {
    title: `${data.name} - SIGIZI`,
    description: `Supplier details for ${data.name}`,
  };
}

export default async function SupplierDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Supplier Details</h1>
        <SupplierActions id={params.id} />
      </div>
      
      <SupplierDetail id={params.id} />
    </div>
  );
}
```

### Form Page

```typescript
// app/(authenticated)/batch/create/page.tsx
import { Metadata } from 'next';
import { BatchForm } from '@/components/batch/BatchForm';

export const metadata: Metadata = {
  title: 'Create Batch - SIGIZI',
  description: 'Create a new batch',
};

export default function CreateBatchPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Batch</h1>
      <BatchForm />
    </div>
  );
}
```

---

## Layout Patterns

### Root Layout

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SIGIZI',
  description: 'Government Supply Chain Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### Authenticated Layout

```typescript
// app/(authenticated)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
```

### Public Layout

```typescript
// app/(public)/layout.tsx
import { Header } from '@/components/layout/PublicHeader';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

---

## Error Handling

### Page Error

```typescript
// app/(authenticated)/batch/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function BatchError({
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
    <div className="text-center py-12">
      <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### Not Found

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-4">
        The page you're looking for doesn't exist.
      </p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
```

---

## Checklist

- [ ] Gunakan App Router (app/)
- [ ] Group routes dengan route groups
- [ ] Buat layout untuk shared UI
- [ ] Pisahkan server dan client components
- [ ] Gunakan loading.tsx untuk loading states
- [ ] Gunakan error.tsx untuk error handling
- [ ] Gunakan not-found.tsx untuk 404 pages
- [ ] Export metadata untuk SEO

---

## Anti-Patterns

```
❌ Put everything in page.tsx
export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/data').then(res => res.json()).then(setData);
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}

✅ Separate components
// page.tsx
import { DataList } from '@/components/DataList';

export default function Page() {
  return <DataList />;
}

// components/DataList.tsx
'use client';
export function DataList() {
  // Client component with data fetching
}

❌ No loading states
export default function Page() {
  return <div>Data</div>;
}

✅ Add loading states
// loading.tsx
export default function Loading() {
  return <div className="animate-pulse">Loading...</div>;
}

❌ No error handling
export default function Page() {
  return <div>Data</div>;
}

✅ Add error handling
// error.tsx
'use client';
export default function Error({ error, reset }) {
  return <button onClick={reset}>Retry</button>;
}
```

---

## References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Routing](https://nextjs.org/docs/app/building-your-application/routing)
- [Layouts](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)
- [Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
