# Pagination Component - Documentation

## Overview

Reusable pagination component untuk SIGIZI frontend dengan desain yang konsisten.

---

## Jenis Pagination

**Numbered Pagination dengan First/Last Page Buttons**

Pagination ini menampilkan:
- Semua nomor halaman (1, 2, 3, ..., n)
- Tombol "First Page" (<<) untuk langsung ke halaman pertama
- Tombol "Previous Page" (<) untuk mundur 1 halaman
- Tombol "Next Page" (>) untuk maju 1 halaman
- Tombol "Last Page" (>>) untuk langsung ke halaman terakhir

---

## File Location

```
apps/portal/src/components/ui/Pagination.tsx
```

---

## API Reference

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentPage` | `number` | ✅ Ya | Halaman aktif saat ini (1-indexed) |
| `totalPages` | `number` | ✅ Ya | Total jumlah halaman |
| `onPageChange` | `(page: number) => void` | ✅ Ya | Callback ketika halaman berubah |
| `className` | `string` | ❌ Tidak | Custom CSS classes (optional) |

---

## Usage Example

### Basic Usage

```tsx
'use client';

import { useState } from 'react';
import { Pagination } from '@/components/ui/Pagination';

export function MyTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalItems = 45;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div>
      {/* Your table/content here */}
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
```

### With Custom Data

```tsx
import { Pagination } from '@/components/ui/Pagination';

<Pagination
  currentPage={currentPage}
  totalPages={5}
  onPageChange={handlePageChange}
  className="mt-6"
/>
```

---

## Styling

### Default Appearance

```
┌─────────────────────────────────────────────────────────┐
│  [<<] [<] [1] [2] [3] [4] [5] [>] [>>]                  │
│       ↑  ↑        ↑        ↑  ↑   ↑                     │
│   First  Prev   Active   Next Last                     │
│                     Current                             │
└─────────────────────────────────────────────────────────┘
```

### States

| State | Appearance |
|-------|-----------|
| **Active Page** | Background: `bg-primary-600`, Text: `text-white` |
| **Inactive Page** | Background: transparent, Text: `text-gray-600`, Hover: `hover:bg-gray-100` |
| **Disabled (First/Last)** | Color: `text-gray-300`, Cursor: `cursor-not-allowed` |
| **Enabled Navigation** | Color: `text-gray-600`, Hover: `hover:bg-gray-100` |

### Icon Buttons

| Button | Icon | Position |
|--------|------|----------|
| First Page | `ChevronsLeft` (<<) | Paling kiri |
| Previous | `ChevronLeft` (<) | Setelah First |
| Page Numbers | Text (1, 2, 3...) | Tengah |
| Next | `ChevronRight` (>) | Sebelum Last |
| Last Page | `ChevronsRight` (>>) | Paling kanan |

---

## Implementation Pattern

### Step 1: Import Component

```tsx
import { Pagination } from '@/components/ui/Pagination';
```

### Step 2: Setup State

```tsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10; // Sesuaikan kebutuhan
```

### Step 3: Calculate Pagination

```tsx
const totalPages = Math.ceil(totalItems / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedData = data.slice(startIndex, endIndex);
```

### Step 4: Render Pagination

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

---

## Best Practices

### ✅ DO

1. **Selalu reset pagination saat filter berubah**
   ```tsx
   const handleFilterChange = (newFilter) => {
     setFilter(newFilter);
     setCurrentPage(1); // Reset ke halaman pertama
   }
   ```

2. **Gunakan itemsPerPage yang konsisten** untuk jenis data yang sama

3. **Sertakan total items info** untuk UX yang lebih baik:
   ```tsx
   <p className="text-sm text-gray-500">
     Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} data
   </p>
   ```

4. **Handle edge cases**:
   - `totalPages <= 1` → Pagination tidak ditampilkan (auto handled)
   - `currentPage` di luar range → Auto corrected (auto handled)

### ❌ DON'T

1. Jangan gunakan `currentPage={0}` (harus 1-indexed)
2. Jangan lupa handle `onPageChange` callback
3. Jangan mix pagination styles dalam satu aplikasi

---

## Customization

### Change Items Per Page

```tsx
// Untuk tabel kecil
const itemsPerPage = 5;

// Untuk tabel medium
const itemsPerPage = 10;

// Untuk tabel besar
const itemsPerPage = 20;
```

### Add Items Per Page Selector

```tsx
<select
  value={itemsPerPage}
  onChange={(e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }}
>
  <option value={5}>5 per halaman</option>
  <option value={10}>10 per halaman</option>
  <option value={20}>20 per halaman</option>
</select>
```

---

## Examples in SIGIZI

### Material Section (4 items/page)

```tsx
// apps/portal/src/components/features/supplier/MaterialSection.tsx
const itemsPerPage = 4;
const paginatedMaterials = materials.slice(startIndex, endIndex);
```

### Network Section (3 items/page)

```tsx
// apps/portal/src/components/features/supplier/NetworkSection.tsx
const itemsPerPage = 3;
const paginatedPartners = partners.slice(startIndex, endIndex);
```

---

## Accessibility

- ✅ `aria-label` pada setiap tombol navigasi
- ✅ `aria-current="page"` pada halaman aktif
- ✅ Keyboard navigation support (tab through buttons)
- ✅ Disabled state untuk tombol first/last di boundary

---

## Performance Notes

- Component di-render ulang hanya saat `currentPage` atau `totalPages` berubah
- Pagination logic menggunakan native array methods (slice, map) yang performant
- Tidak ada external dependencies selain lucide-react icons

---

## Future Enhancements

Potential improvements:

1. **Ellipsis untuk banyak halaman** (1 ... 5 6 7 ... 20)
2. **Jump to page input** untuk navigasi cepat
3. **Infinite scroll** alternative untuk mobile
4. **Responsive layout** dengan fewer page numbers on mobile

---

*Last Updated: 2026-07-10*
