# repository-pattern

## Tujuan

Implementasi Repository Pattern untuk abstraksi data access layer menggunakan Prisma.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  REPOSITORY PATTERN RULES                                   │
├─────────────────────────────────────────────────────────────┤
│  1. Repository interface di domain layer                    │
│  2. Repository implementation di infrastructure layer       │
│  3. Gunakan @Injectable() untuk repository implementation   │
│  4. Gunakan DI token untuk inject repository                │
│  5. Return domain entity, bukan Prisma model                │
│  6. Map Prisma model ke domain entity                       │
│  7. Handle error di repository                              │
│  8. Gunakan transaction untuk operasi kompleks              │
└─────────────────────────────────────────────────────────────┘
```

---

## Template

### Interface (Domain Layer)

```typescript
// domain/repositories/supplier.repository.ts
import { Supplier } from '../entities';

export interface SupplierRepository {
  // Basic CRUD
  findAll(params?: FindAllParams): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  findByNpwp(npwp: string): Promise<Supplier | null>;
  create(data: CreateSupplierData): Promise<Supplier>;
  update(id: string, data: UpdateSupplierData): Promise<Supplier>;
  delete(id: string): Promise<void>;

  // Bulk operations
  createMany(data: CreateSupplierData[]): Promise<Supplier[]>;
  deleteMany(ids: string[]): Promise<void>;

  // Query
  count(params?: CountParams): Promise<number>;
}

// Types
export interface FindAllParams {
  skip?: number;
  take?: number;
  where?: SupplierWhereInput;
  orderBy?: SupplierOrderByInput;
}

export interface CreateSupplierData {
  name: string;
  npwp: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierData {
  name?: string;
  phone?: string;
  address?: string;
}

export interface SupplierWhereInput {
  name?: { contains: string; mode: 'insensitive' };
  npwp?: string;
  deletedAt?: Date | null;
}

export type SupplierOrderByInput = 
  | { name: 'asc' | 'desc' }
  | { createdAt: 'asc' | 'desc' };
```

### Implementation (Infrastructure Layer)

```typescript
// infrastructure/prisma/supplier.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Supplier } from '../../domain/entities';
import { 
  SupplierRepository,
  FindAllParams,
  CreateSupplierData,
  UpdateSupplierData,
} from '../../domain/repositories';
import { SupplierMapper } from './prisma-supplier.mapper';

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: SupplierMapper,
  ) {}

  async findAll(params: FindAllParams = {}): Promise<Supplier[]> {
    const { skip = 0, take = 10, where, orderBy } = params;
    
    const suppliers = await this.prisma.supplier.findMany({
      skip,
      take,
      where: this.toPrismaWhere(where),
      orderBy: this.toPrismaOrderBy(orderBy),
    });

    return suppliers.map((s) => this.mapper.toDomain(s));
  }

  async findById(id: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    return supplier ? this.mapper.toDomain(supplier) : null;
  }

  async findByNpwp(npwp: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { npwp },
    });

    return supplier ? this.mapper.toDomain(supplier) : null;
  }

  async create(data: CreateSupplierData): Promise<Supplier> {
    const supplier = await this.prisma.supplier.create({
      data: {
        name: data.name,
        npwp: data.npwp,
        phone: data.phone,
        address: data.address,
      },
    });

    return this.mapper.toDomain(supplier);
  }

  async update(id: string, data: UpdateSupplierData): Promise<Supplier> {
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data,
    });

    return this.mapper.toDomain(supplier);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createMany(data: CreateSupplierData[]): Promise<Supplier[]> {
    const suppliers = await Promise.all(
      data.map((d) => this.create(d)),
    );
    return suppliers;
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.supplier.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });
  }

  async count(params: { where?: SupplierWhereInput } = {}): Promise<number> {
    return this.prisma.supplier.count({
      where: this.toPrismaWhere(params.where),
    });
  }

  // Private helpers
  private toPrismaWhere(where?: SupplierWhereInput) {
    if (!where) return {};

    return {
      name: where.name,
      npwp: where.npwp,
      deletedAt: where.deletedAt,
    };
  }

  private toPrismaOrderBy(orderBy?: SupplierOrderByInput) {
    if (!orderBy) return { createdAt: 'desc' as const };
    return orderBy;
  }
}
```

### DI Token

```typescript
// domain/repositories/tokens.ts
export const SUPPLIER_REPOSITORY = 'SUPPLIER_REPOSITORY';
export const BATCH_REPOSITORY = 'BATCH_REPOSITORY';
export const SPPG_REPOSITORY = 'SPPG_REPOSITORY';
```

### Module Registration

```typescript
// supplier.module.ts
import { Module } from '@nestjs/common';
import { SUPPLIER_REPOSITORY } from './domain';
import { PrismaSupplierRepository } from './infrastructure';
import { SupplierService } from './application';
import { SupplierController } from './presentation';

@Module({
  controllers: [SupplierController],
  providers: [
    SupplierService,
    {
      provide: SUPPLIER_REPOSITORY,
      useClass: PrismaSupplierRepository,
    },
  ],
  exports: [SupplierService],
})
export class SupplierModule {}
```

---

## Checklist

- [ ] Buat interface di domain layer
- [ ] Buat implementation di infrastructure layer
- [ ] Map Prisma model ke domain entity
- [ ] Register di module dengan DI token
- [ ] Gunakan @Injectable() untuk implementation
- [ ] Return domain entity, bukan Prisma model
- [ ] Handle error dengan proper exception

---

## Anti-Patterns

```
❌ Return Prisma model langsung
async findById(id: string): Promise<any> {
  return this.prisma.supplier.findUnique({ where: { id } });
}

✅ Return domain entity
async findById(id: string): Promise<Supplier | null> {
  const supplier = await this.prisma.supplier.findUnique({ where: { id } });
  return supplier ? this.mapper.toDomain(supplier) : null;
}

❌ Import PrismaService di domain layer
import { PrismaService } from '../../database';

✅ Define interface only
export interface SupplierRepository { ... }

❌ Business logic di repository
async create(data: CreateSupplierData) {
  if (data.npwp.length !== 15) {
    throw new Error('NPWP must be 15 characters');
  }
  return this.prisma.supplier.create({ data });
}

✅ Business logic di service/domain
async create(dto: CreateSupplierDto) {
  if (dto.npwp.length !== 15) {
    throw new BadRequestException('NPWP must be 15 characters');
  }
  const supplier = new Supplier(...);
  return this.repository.create(supplier);
}
```

---

## References

- [Repository Pattern](https://martinfowler.com/eaaRepository.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS DI](https://docs.nestjs.com/fundamentals/dependency-injection)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
