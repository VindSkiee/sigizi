# testing-pattern

## Tujuan

Menulis tests yang terstruktur untuk React components, hooks, dan pages.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  TESTING PATTERN RULES                                      │
├─────────────────────────────────────────────────────────────┤
│  1. Gunakan Vitest atau Jest                                │
│  2. Test behavior, bukan implementation                     │
│  3. Gunakan React Testing Library                           │
│  4. Mock API calls dan external dependencies                │
│  5. Test accessibility                                      │
│  6. Test semua user interactions                            │
│  7. Maintain test coverage minimal 80%                      │
│  8. Jalankan tests sebelum commit                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup

### Package Installation

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup

```typescript
// test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
```

---

## Component Tests

### Button Test

```typescript
// components/ui/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toContainHTML('svg');
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });
});
```

### BatchCard Test

```typescript
// components/batch/BatchCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BatchCard } from './BatchCard';
import { Batch } from '@/types/api';

const mockBatch: Batch = {
  id: '1',
  batchNumber: 'BATCH-001',
  date: '2026-07-09',
  status: 'ACTIVE',
  sppg: { id: '1', name: 'SPPG Jakarta', address: 'Jakarta' },
  items: [],
  createdAt: '2026-07-09T00:00:00Z',
  updatedAt: '2026-07-09T00:00:00Z',
};

describe('BatchCard', () => {
  it('renders batch number', () => {
    render(<BatchCard batch={mockBatch} />);
    expect(screen.getByText('BATCH-001')).toBeInTheDocument();
  });

  it('renders SPPG name', () => {
    render(<BatchCard batch={mockBatch} />);
    expect(screen.getByText('SPPG Jakarta')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<BatchCard batch={mockBatch} />);
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BatchCard batch={mockBatch} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('BATCH-001'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders formatted date', () => {
    render(<BatchCard batch={mockBatch} />);
    expect(screen.getByText(/Jul 9, 2026/)).toBeInTheDocument();
  });
});
```

### BatchForm Test

```typescript
// components/batch/BatchForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BatchForm } from './BatchForm';

describe('BatchForm', () => {
  const mockOnSubmit = vi.fn();
  const mockSppgs = [
    { id: '1', name: 'SPPG Jakarta' },
    { id: '2', name: 'SPPG Bandung' },
  ];

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form fields', () => {
    render(<BatchForm onSubmit={mockOnSubmit} sppgs={mockSppgs} />);
    
    expect(screen.getByLabelText(/batch number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sppg/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<BatchForm onSubmit={mockOnSubmit} sppgs={mockSppgs} />);
    
    await user.click(screen.getByRole('button', { name: /create batch/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/batch number is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<BatchForm onSubmit={mockOnSubmit} sppgs={mockSppgs} />);
    
    await user.type(screen.getByLabelText(/batch number/i), 'BATCH-001');
    await user.type(screen.getByLabelText(/date/i), '2026-07-09');
    await user.click(screen.getByRole('button', { name: /create batch/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        batchNumber: 'BATCH-001',
        date: '2026-07-09',
        sppgId: '',
        status: 'ACTIVE',
      });
    });
  });

  it('disables form when loading', () => {
    render(<BatchForm onSubmit={mockOnSubmit} sppgs={mockSppgs} isLoading />);
    
    expect(screen.getByLabelText(/batch number/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /create batch/i })).toBeDisabled();
  });
});
```

---

## Hook Tests

### useBatches Test

```typescript
// hooks/useBatches.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBatches } from './useBatches';
import { api } from '@/lib/api';

vi.mock('@/lib/api');

describe('useBatches', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockClear();
  });

  it('fetches batches on mount', async () => {
    const mockBatches = [
      { id: '1', batchNumber: 'BATCH-001' },
      { id: '2', batchNumber: 'BATCH-002' },
    ];

    vi.mocked(api.get).mockResolvedValue({ data: mockBatches });

    const { result } = renderHook(() => useBatches());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBatches);
    expect(api.get).toHaveBeenCalledWith('/batches', {});
  });

  it('handles errors', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useBatches());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('refetches when filters change', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });

    const { result, rerender } = renderHook(
      ({ filters }) => useBatches(filters),
      { initialProps: { filters: { status: 'ACTIVE' } } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender({ filters: { status: 'COMPLETED' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/batches', { status: 'COMPLETED' });
    });
  });
});
```

---

## Page Tests

### BatchPage Test

```typescript
// app/(authenticated)/batch/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BatchPage from './page';
import { api } from '@/lib/api';

vi.mock('@/lib/api');

describe('BatchPage', () => {
  it('renders batch list', async () => {
    const mockBatches = [
      { id: '1', batchNumber: 'BATCH-001' },
      { id: '2', batchNumber: 'BATCH-002' },
    ];

    vi.mocked(api.get).mockResolvedValue({ data: mockBatches });

    render(<BatchPage />);

    expect(screen.getByText('Batch Tracking')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('BATCH-001')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));

    render(<BatchPage />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error state', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Failed to fetch'));

    render(<BatchPage />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## Accessibility Tests

```typescript
// components/ui/button.a11y.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has proper aria-label when loading', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('is keyboard accessible', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    
    expect(button).toHaveFocus();
  });
});
```

---

## Run Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:cov

# Run in watch mode
pnpm test:watch

# Run specific file
pnpm test Button.test.tsx
```

---

## Checklist

- [ ] Setup Vitest atau Jest
- [ ] Setup React Testing Library
- [ ] Write component tests
- [ ] Write hook tests
- [ ] Write page tests
- [ ] Mock API calls
- [ ] Test accessibility
- [ ] Maintain test coverage minimal 80%

---

## Anti-Patterns

```
❌ Test implementation details
it('should call useState', () => {
  const { result } = renderHook(() => useBatches());
  expect(typeof result.current.loading).toBe('boolean');
});

✅ Test behavior
it('shows loading state while fetching', async () => {
  const { result } = renderHook(() => useBatches());
  expect(result.current.loading).toBe(true);
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
});

❌ Test snapshot
it('matches snapshot', () => {
  const { container } = render(<Button>Click</Button>);
  expect(container).toMatchSnapshot();
});

✅ Test functionality
it('renders with text', () => {
  render(<Button>Click</Button>);
  expect(screen.getByText('Click')).toBeInTheDocument();
});

❌ No mock for API
it('fetches batches', async () => {
  render(<BatchPage />);
  // Will fail because API is not mocked
});

✅ Mock API
vi.mock('@/lib/api');

it('fetches batches', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: [] });
  render(<BatchPage />);
  // Now works
});
```

---

## References

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Jest DOM](https://github.com/testing-library/jest-dom)
- [jest-axe](https://github.com/dequelabs/jest-axe)
- [docs/frontend/PATTERNS.md](../PATTERNS.md)
