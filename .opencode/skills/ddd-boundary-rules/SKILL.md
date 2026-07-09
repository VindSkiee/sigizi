# ddd-boundary-rules

## Tujuan

Menjaga batas antar domain agar tidak ada coupling yang melanggar prinsip DDD dan Clean Architecture.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  DDD BOUNDARY RULES                                         │
├─────────────────────────────────────────────────────────────┤
│  1. Domain layer TIDAK boleh import infrastructure          │
│  2. Domain layer TIDAK boleh import presentation            │
│  3. Application layer hanya depend on domain                │
│  4. Infrastructure implement interface dari domain          │
│  5. Presentation hanya boleh akses application layer        │
│  6. Interaksi antar module melalui public API saja          │
│  7. Jangan import internal module lain secara langsung      │
└─────────────────────────────────────────────────────────────┘
```

---

## Dependency Rules

### Layer Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPENDENCY FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Presentation ──▶ Application ──▶ Domain ◀── Infrastructure│
│                                                             │
│  Domain is the CENTER - nothing depends on it from outside  │
└─────────────────────────────────────────────────────────────┘
```

### Visual Dependency Matrix

| From \ To | Domain | Application | Infrastructure | Presentation |
|-----------|:------:|:-----------:|:--------------:|:------------:|
| Domain | ✅ | ❌ | ❌ | ❌ |
| Application | ✅ | ✅ | ❌ | ❌ |
| Infrastructure | ✅ | ❌ | ✅ | ❌ |
| Presentation | ❌ | ✅ | ❌ | ✅ |

---

## Import Rules

### ✅ YANG DIPERBOLEHKAN

```typescript
// 1. Domain import domain lain (sama module)
import { SupplierId } from '../value-objects';
import { Supplier } from '../entities';

// 2. Application import domain
import { Supplier } from '../domain';
import { SupplierRepository } from '../domain';

// 3. Infrastructure implement domain interface
import { SupplierRepository } from '../domain';
import { Supplier } from '../domain';

// 4. Presentation import application
import { SupplierService } from '../application';
import { CreateSupplierDto } from '../application';
```

### ❌ YANG TIDAK DIPERBOLEHKAN

```typescript
// 1. Domain import infrastructure
import { PrismaClient } from '@prisma/client';
import { PrismaSupplierRepository } from '../infrastructure';

// 2. Domain import presentation
import { SupplierController } from '../presentation';

// 3. Domain import application
import { SupplierService } from '../application';

// 4. Application import infrastructure
import { PrismaService } from '../infrastructure';

// 5. Module import internal module lain
import { BatchService } from '../batch/application';
import { BatchRepository } from '../batch/domain';

// 6. Infrastructure import presentation
import { SupplierController } from '../presentation';
```

---

## Cross-Module Communication

### ❌ BAD: Direct Import

```typescript
// supplier.service.ts
import { BatchService } from '../batch/application';

export class SupplierService {
  constructor(private readonly batchService: BatchService) {}
  
  async getSupplierBatches(supplierId: string) {
    return this.batchService.findBySupplier(supplierId); // VIOLATION!
  }
}
```

### ✅ GOOD: Use Interface/Token

```typescript
// supplier/domain/repositories/batch.repository.ts
export const BATCH_REPOSITORY = 'BATCH_REPOSITORY';

export interface BatchRepository {
  findBySupplier(supplierId: string): Promise<Batch[]>;
}

// supplier/application/services/supplier.service.ts
import { BATCH_REPOSITORY } from '../domain';

export class SupplierService {
  constructor(
    @Inject(BATCH_REPOSITORY)
    private readonly batchRepository: BatchRepository,
  ) {}
  
  async getSupplierBatches(supplierId: string) {
    return this.batchRepository.findBySupplier(supplierId);
  }
}

// supplier/supplier.module.ts
import { BATCH_REPOSITORY } from './domain';
import { PrismaBatchRepository } from './infrastructure';

@Module({
  providers: [
    {
      provide: BATCH_REPOSITORY,
      useClass: PrismaBatchRepository,
    },
  ],
})
export class SupplierModule {}
```

---

## Module Isolation

### ✅ GOOD: Module Public API

```typescript
// batch/index.ts (public API)
export * from './application/services';
export * from './presentation/http/dto/response';

// supplier.service.ts
import { BatchService, BatchResponseDto } from '@sigizi/batch';
```

### ❌ BAD: Import Internal Files

```typescript
// supplier.service.ts
import { BatchService } from '../batch/application/services/batch.service';
import { PrismaBatchRepository } from '../batch/infrastructure/prisma/batch.repository';
```

---

## Checklist

- [ ] Domain tidak import PrismaClient
- [ ] Domain tidak import Controller
- [ ] Application tidak import Infrastructure
- [ ] Infrastructure implement interface dari Domain
- [ ] Presentation hanya import dari Application
- [ ] Module tidak import internal module lain
- [ ] Cross-module via interface/Token injection

---

## Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| God Service | Service terlalu banyak responsibility | Split per domain |
| Circular Dependency | Module A depend on B, B depend on A | Use interface/Token |
| Anemic Domain | Business logic di service, entity kosong | Move logic to entity |
| Leaky Abstraction | Prisma types di domain layer | Map to domain entity |

---

## References

- [DDD Blue Books](https://www.domainlanguage.com/ddd/)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/dependency-injection)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
- [docs/backend/MCP.md](../MCP.md)
