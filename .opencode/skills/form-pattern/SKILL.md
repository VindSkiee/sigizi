# form-pattern

## Tujuan

Implementasi form yang robust dengan validation, error handling, dan user experience yang baik.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  FORM PATTERN RULES                                         │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan react-hook-form untuk form management           │
│  2. Gunakan zod untuk schema validation                     │
│  3. Tampilkan error messages yang jelas                     │
│  4. Disable submit button saat loading                      │
│  5. Reset form setelah success submit                       │
│  6. Handle server errors                                    │
│  7. Gunakan controlled components                           │
│  8. Test semua form scenarios                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup

### Package Installation

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

---

## Form Templates

### Basic Form

```typescript
// components/batch/BatchForm.tsx
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

// Schema
const batchSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  date: z.string().min(1, 'Date is required'),
  sppgId: z.string().min(1, 'SPPG is required'),
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
});

type BatchFormData = z.infer<typeof batchSchema>;

// Props
interface BatchFormProps {
  onSubmit: (data: BatchFormData) => Promise<void>;
  initialData?: Partial<BatchFormData>;
  isLoading?: boolean;
  sppgs?: Array<{ id: string; name: string }>;
}

// Component
export function BatchForm({
  onSubmit,
  initialData,
  isLoading = false,
  sppgs = [],
}: BatchFormProps) {
  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchNumber: initialData?.batchNumber || '',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      sppgId: initialData?.sppgId || '',
      status: initialData?.status || 'ACTIVE',
    },
  });

  const handleSubmit = async (data: BatchFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // Error is handled by parent component
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="batchNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="BATCH-001"
                  disabled={isLoading}
                  {...field}
                />
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
              <FormLabel>Date *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  disabled={isLoading}
                  {...field}
                />
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
              <FormLabel>SPPG *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Update Batch' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Form with Server Errors

```typescript
// components/supplier/SupplierForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api';
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

const supplierSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  npwp: z.string().length(15, 'NPWP must be 15 digits'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => Promise<void>;
  initialData?: Partial<SupplierFormData>;
  isLoading?: boolean;
}

export function SupplierForm({
  onSubmit,
  initialData,
  isLoading = false,
}: SupplierFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialData?.name || '',
      npwp: initialData?.npwp || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
    },
  });

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      setServerError(null);
      await onSubmit(data);
      form.reset();
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError('An unexpected error occurred');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="PT Supplier ABC"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="npwp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NPWP *</FormLabel>
              <FormControl>
                <Input
                  placeholder="123456789012345"
                  maxLength={15}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  placeholder="08123456789"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="Jl. Supplier No. 1"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => form.reset()}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? 'Update Supplier' : 'Create Supplier'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Dynamic Form

```typescript
// components/batch/BatchItemForm.tsx
'use client';

import { useFieldArray, useForm } from 'react-hook-form';
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

const batchItemSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().min(1, 'Item is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unitPrice: z.number().min(0, 'Price must be positive'),
    })
  ).min(1, 'At least one item is required'),
});

type BatchItemFormData = z.infer<typeof batchItemSchema>;

interface BatchItemFormProps {
  onSubmit: (data: BatchItemFormData) => Promise<void>;
  isLoading?: boolean;
}

export function BatchItemForm({ onSubmit, isLoading }: BatchItemFormProps) {
  const form = useForm<BatchItemFormData>({
    resolver: zodResolver(batchItemSchema),
    defaultValues: {
      items: [{ itemId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Items</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ itemId: '', quantity: 1, unitPrice: 0 })}
            >
              Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <FormField
                control={form.control}
                name={`items.${index}.itemId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Item</FormLabel>
                    <FormControl>
                      <Input placeholder="Item ID" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Qty</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.unitPrice`}
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                disabled={isLoading || fields.length === 1}
                className="mt-8"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading}>
            Save Items
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## Checklist

- [ ] Gunakan react-hook-form
- [ ] Gunakan zod untuk validation
- [ ] Tampilkan error messages
- [ ] Disable submit button saat loading
- [ ] Reset form setelah success
- [ ] Handle server errors
- [ ] Gunakan controlled components
- [ ] Test semua form scenarios

---

## Anti-Patterns

```
❌ Uncontrolled form
<form onSubmit={handleSubmit}>
  <input name="batchNumber" />
</form>

✅ Controlled form
<Form {...form}>
  <FormField
    control={form.control}
    name="batchNumber"
    render={({ field }) => (
      <Input {...field} />
    )}
  />
</Form>

❌ No validation
const schema = z.object({
  name: z.string(),
});

✅ Proper validation
const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
});

❌ No error handling
<form onSubmit={async (data) => {
  await api.post('/batches', data);
}}>

✅ Handle errors
<form onSubmit={async (data) => {
  try {
    await api.post('/batches', data);
  } catch (error) {
    if (error instanceof ApiError) {
      setServerError(error.message);
    }
  }
}}>
```

---

## References

- [react-hook-form](https://react-hook-form.com/)
- [zod](https://zod.dev/)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
