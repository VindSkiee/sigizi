# tailwind-styling-pattern

## Tujuan

Styling konsisten menggunakan Tailwind CSS dengan design system yang terstruktur.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  TAILWIND STYLING PATTERN RULES                             │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan utility classes daripada custom CSS             │
│  2. Buat design tokens di tailwind.config.ts                │
│  3. Gunakan cn() utility untuk conditional classes          │
│  4. Buat reusable components untuk patterns umum            │
│  5. Gunakan responsive design (mobile-first)                │
│  6. Konsisten dengan spacing, colors, dan typography        │
│  7. Gunakan dark mode support                               │
│  8. Optimize dengan purge/ content config                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Tokens

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Utility Function

### cn() Utility

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Usage

```typescript
import { cn } from '@/lib/utils';

// Conditional classes
<button
  className={cn(
    'px-4 py-2 rounded-md',
    isActive && 'bg-primary-500 text-white',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  Click me
</button>
```

---

## Component Patterns

### Button Variants

```typescript
// components/ui/button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'disabled:pointer-events-none disabled:opacity-50',
        
        // Variants
        {
          'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
          'bg-secondary-200 text-secondary-900 hover:bg-secondary-300': variant === 'secondary',
          'bg-transparent hover:bg-secondary-100': variant === 'ghost',
          'bg-error text-white hover:bg-red-600': variant === 'danger',
        },
        
        // Sizes
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Card Component

```typescript
// components/ui/card.tsx
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

export function Card({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-white',
        {
          'shadow-sm': variant === 'default',
          'border border-secondary-200': variant === 'bordered',
          'shadow-lg': variant === 'elevated',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
```

### Input Component

```typescript
// components/ui/input.tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-secondary-700"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm',
            'placeholder:text-secondary-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus:ring-error',
            !error && 'border-secondary-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
```

---

## Responsive Design

### Mobile-First Approach

```typescript
// components/layout/Sidebar.tsx
export function Sidebar() {
  return (
    <aside className="hidden lg:block w-64 bg-secondary-900 text-white">
      {/* Sidebar content */}
    </aside>
  );
}

// Mobile sidebar with overlay
export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-secondary-900 text-white rounded-md"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-secondary-900 text-white">
            {/* Sidebar content */}
          </aside>
        </div>
      )}
    </>
  );
}
```

### Responsive Grid

```typescript
// components/dashboard/StatsGrid.tsx
export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard title="Total Batches" value="128" />
      <StatsCard title="Active Suppliers" value="24" />
      <StatsCard title="SPPGs" value="12" />
      <StatsCard title="Beneficiaries" value="1,024" />
    </div>
  );
}
```

---

## Dark Mode

### Configuration

```typescript
// tailwind.config.ts
const config: Config = {
  darkMode: 'class',
  // ... rest of config
};
```

### Implementation

```typescript
// components/ui/button.tsx
export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'bg-primary-600 text-white',
        'dark:bg-primary-500 dark:text-white',
        'hover:bg-primary-700 dark:hover:bg-primary-600',
        className
      )}
      {...props}
    />
  );
}
```

---

## Checklist

- [ ] Setup design tokens di tailwind.config.ts
- [ ] Buat cn() utility
- [ ] Buat reusable UI components
- [ ] Gunakan responsive design (mobile-first)
- [ ] Support dark mode
- [ ] Konsisten dengan spacing, colors, typography
- [ ] Optimize dengan purge config
- [ ] Test semua components

---

## Anti-Patterns

```
❌ Custom CSS
<style>
  .button {
    padding: 8px 16px;
    background-color: #3b82f6;
    color: white;
    border-radius: 4px;
  }
</style>

✅ Tailwind utility classes
<button className="px-4 py-2 bg-primary-600 text-white rounded-md">

❌ Inline styles
<div style={{ padding: '16px', backgroundColor: 'white' }}>

✅ Tailwind classes
<div className="p-4 bg-white">

❌ Hardcoded colors
<div className="bg-blue-500">

✅ Use design tokens
<div className="bg-primary-500">

❌ Not responsive
<div className="grid grid-cols-4">

✅ Responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

---

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/)
- [Headless UI](https://headlessui.com/)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
