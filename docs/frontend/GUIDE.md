# Frontend Development Guide

## Role: @frontend

Anda adalah **Frontend Agent** yang bekerja di `apps/portal/`.

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js | ^14.1.0 |
| React | React | ^18.2.0 |
| Styling | Tailwind CSS | ^3.4.1 |
| Language | TypeScript | ^5.4.0 |

---

## Rendering Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDERING MODE                           │
├─────────────────────────────────────────────────────────────┤
│  CSR (Client-Side Rendering)                               │
│  ├── / (Home page)                                         │
│  ├── /dashboard (if any)                                   │
│  └── Most pages                                            │
│                                                             │
│  SSR (Server-Side Rendering)                               │
│  └── /batch (Public batch tracking)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
apps/portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home (CSR)
│   │   ├── globals.css             # Global styles
│   │   └── batch/
│   │       └── page.tsx            # Batch tracking (SSR)
│   ├── components/                 # Reusable components
│   ├── hooks/                      # Custom hooks
│   └── lib/
│       ├── api.ts                  # API client
│       └── utils.ts                # Utility functions
├── public/                         # Static assets
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## Key Files to Know

### 1. API Client
```
src/lib/api.ts
```
- Semua API calls ke backend
- Export functions: `getBatchByNumber`, `loginSso`, `getSuppliers`, dll

### 2. Utility Functions
```
src/lib/utils.ts
```
- `cn()` - Merge Tailwind classes
- `formatCurrency()` - Format rupiah
- `formatDate()` - Format tanggal

### 3. Pages
```
src/app/page.tsx        - Home (CSR)
src/app/batch/page.tsx  - Batch tracking (SSR)
```

---

## Common Tasks

### 1. Add New Page (CSR)

```tsx
// 1. Create page component
// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Fetch data on client
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {/* Content */}
    </div>
  );
}
```

### 2. Add New Page (SSR)

```tsx
// 1. Create page component
// src/app/product/[id]/page.tsx

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Fetch data on server
  const product = await getProduct(params.id);

  return (
    <div>
      <h1>{product.name}</h1>
      {/* Content */}
    </div>
  );
}
```

### 3. Add API Call

```tsx
// 1. Add function to api.ts
export async function getProduct(id: string) {
  return fetchApi(`/api/products/${id}`);
}

// 2. Use in component
import { getProduct } from '@/lib/api';

const product = await getProduct('123');
```

### 4. Add Component

```tsx
// 1. Create component file
// src/components/ProductCard.tsx

interface ProductCardProps {
  name: string;
  price: number;
}

export function ProductCard({ name, price }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-green-600">Rp {price.toLocaleString()}</p>
    </div>
  );
}

// 2. Use in page
import { ProductCard } from '@/components/ProductCard';

<ProductCard name="Beras" price={12000} />
```

---

## Styling with Tailwind

### Basic Classes

```tsx
// Layout
<div className="container mx-auto px-4">
<div className="flex gap-4">
<div className="grid grid-cols-3 gap-4">

// Typography
<h1 className="text-2xl font-bold text-gray-800">
<p className="text-sm text-gray-500">

// Colors
<div className="bg-green-50 text-green-700">
<button className="bg-blue-600 hover:bg-blue-700">

// Spacing
<div className="p-4 m-2 mb-4">

// Border
<div className="border border-gray-200 rounded-lg">
```

### Responsive

```tsx
// Mobile first
<div className="w-full md:w-1/2 lg:w-1/3">

// Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## CSR vs SSR Decision

| Use CSR When | Use SSR When |
|--------------|--------------|
| Dashboard | Public pages |
| User-specific data | SEO important |
| Interactive UI | Initial load performance |
| Real-time updates | Social sharing |

---

## API Response Handling

```tsx
// Success
const response = await getProduct(id);
if (response.success) {
  setData(response.data);
}

// Error
try {
  const response = await getProduct(id);
  setData(response.data);
} catch (error) {
  setError(error.message);
}
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

- [PATTERNS.md](./PATTERNS.md) - UI patterns & conventions
- [CONTEXT_RECOVERY.md](./CONTEXT_RECOVERY.md) - Context recovery protocol
- `docs/API.md` - API documentation
