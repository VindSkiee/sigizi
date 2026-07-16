# react-component-pattern

## Tujuan

Membuat React components yang reusable, maintainable, dan terstruktur dengan baik.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  REACT COMPONENT PATTERN RULES                              │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan functional components                           │
│  2. Pisahkan presentational dan container components        │
│  3. Gunakan composition untuk reuse                         │
│  4. Buat components kecil dan terfokus                      │
│  5. Gunakan TypeScript untuk type safety                    │
│  6. Buat index.ts untuk exports                            │
│  7. Gunakan naming convention yang konsisten                │
│  8. Test semua components                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
components/
├── ui/                                 # Generic UI components
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── index.ts
│   │   └── Button.test.tsx
│   ├── input/
│   │   ├── Input.tsx
│   │   └── index.ts
│   ├── skeleton/
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   └── index.ts
│
├── layout/                             # Layout components
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   └── index.ts
│
├── batch/                              # Feature components
│   ├── BatchList/
│   │   ├── BatchList.tsx
│   │   ├── BatchListSkeleton.tsx
│   │   ├── BatchCard.tsx
│   │   └── index.ts
│   ├── BatchForm/
│   │   ├── BatchForm.tsx
│   │   ├── BatchFormFields.tsx
│   │   └── index.ts
│   └── index.ts
│
├── supplier/                           # Feature components
│   ├── SupplierTable/
│   │   ├── SupplierTable.tsx
│   │   ├── SupplierTableRow.tsx
│   │   └── index.ts
│   └── index.ts
│
└── index.ts                            # Global exports
```

---

## Component Templates

### Basic Component

```typescript
// components/ui/button/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
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
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
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
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Container Component

```typescript
// components/batch/BatchList/BatchList.tsx
'use client';

import { Batch } from '@/types/batch';
import { BatchCard } from './BatchCard';
import { BatchListSkeleton } from './BatchListSkeleton';

interface BatchListProps {
  batches: Batch[];
  loading?: boolean;
  error?: string | null;
  onSelect?: (batch: Batch) => void;
}

export function BatchList({
  batches,
  loading = false,
  error = null,
  onSelect,
}: BatchListProps) {
  if (loading) {
    return <BatchListSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No batches found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {batches.map((batch) => (
        <BatchCard
          key={batch.id}
          batch={batch}
          onClick={() => onSelect?.(batch)}
        />
      ))}
    </div>
  );
}
```

### Presentational Component

```typescript
// components/batch/BatchList/BatchCard.tsx
import { Batch } from '@/types/batch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface BatchCardProps {
  batch: Batch;
  onClick?: () => void;
}

export function BatchCard({ batch, onClick }: BatchCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{batch.batchNumber}</CardTitle>
          <Badge variant={batch.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {batch.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">{formatDate(batch.date)}</p>
          </div>
          <div>
            <p className="text-gray-500">SPPG</p>
            <p className="font-medium">{batch.sppg.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Items</p>
            <p className="font-medium">{batch.items.length} items</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-medium">{formatDate(batch.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Form Component

```typescript
// components/batch/BatchForm/BatchForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const batchSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  date: z.string().min(1, 'Date is required'),
  sppgId: z.string().min(1, 'SPPG is required'),
});

type BatchFormData = z.infer<typeof batchSchema>;

interface BatchFormProps {
  onSubmit: (data: BatchFormData) => void;
  isLoading?: boolean;
  sppgs?: Array<{ id: string; name: string }>;
}

export function BatchForm({ onSubmit, isLoading, sppgs = [] }: BatchFormProps) {
  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchNumber: '',
      date: '',
      sppgId: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="batchNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch Number</FormLabel>
              <FormControl>
                <Input placeholder="BATCH-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sppgId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SPPG</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select SPPG" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sppgs.map((sppg) => (
                    <SelectItem key={sppg.id} value={sppg.id}>
                      {sppg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" isLoading={isLoading}>
          Create Batch
        </Button>
      </form>
    </Form>
  );
}
```

---

## Composition Patterns

### Compound Components

```typescript
// components/ui/card/Card.tsx
import { forwardRef, HTMLAttributes, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

interface CardContextValue {
  variant?: 'default' | 'bordered';
}

const CardContext = createContext<CardContextValue>({});

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & CardContextValue>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <CardContext.Provider value={{ variant }}>
        <div
          ref={ref}
          className={cn(
            'rounded-lg bg-white shadow-sm',
            variant === 'bordered' && 'border',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CardContext.Provider>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
```

### Render Props

```typescript
// components/batch/BatchList/BatchListWithQuery.tsx
'use client';

import { useBatches } from '@/hooks/useBatches';
import { BatchList } from './BatchList';
import { BatchListSkeleton } from './BatchListSkeleton';

interface BatchListWithQueryProps {
  filters?: Record<string, any>;
  onSelect?: (batch: any) => void;
}

export function BatchListWithQuery({ filters, onSelect }: BatchListWithQueryProps) {
  const { batches, loading, error } = useBatches(filters);

  return (
    <BatchList
      batches={batches}
      loading={loading}
      error={error}
      onSelect={onSelect}
    />
  );
}
```

---

## Checklist

- [ ] Gunakan functional components
- [ ] Pisahkan presentational dan container components
- [ ] Gunakan composition untuk reuse
- [ ] Buat components kecil dan terfokus
- [ ] Gunakan TypeScript untuk type safety
- [ ] Buat index.ts untuk exports
- [ ] Gunakan naming convention yang konsisten
- [ ] Test semua components

---

## Anti-Patterns

```
❌ Giant component
export function BatchPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  
  useEffect(() => {
    fetchBatches();
  }, []);
  
  // 200+ lines of JSX
  return <div>...</div>;
}

✅ Split into smaller components
export function BatchPage() {
  return (
    <div>
      <BatchHeader />
      <BatchFilters />
      <BatchList />
    </div>
  );
}

❌ Inline styles
<div style={{ padding: '16px', backgroundColor: 'white' }}>

✅ Use Tailwind classes
<div className="p-4 bg-white">

❌ No prop types
function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

✅ Define prop types
interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

---

## References

- [React Documentation](https://react.dev/)
- [React Patterns](https://reactpatterns.com/)
- [Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
