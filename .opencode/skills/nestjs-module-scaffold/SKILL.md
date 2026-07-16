# nestjs-module-scaffold

## Tujuan

Generate module NestJS menggunakan Clean Architecture + DDD untuk menjaga konsistensi struktur kode.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  MODULE SCAFFOLD RULES                                      │
├─────────────────────────────────────────────────────────────┤
│  1. Setiap module harus punya 4 layer: domain, application, │
│     infrastructure, presentation                            │
│  2. Gunakan index.ts sebagai public entry setiap layer      │
│  3. Domain layer tidak boleh depend on layer lain           │
│  4. Application layer hanya depend on domain                │
│  5. Infrastructure implement interface dari domain          │
│  6. Presentation depend pada application saja               │
└─────────────────────────────────────────────────────────────┘
```

---

## Template

### Struktur Folder

```
src/modules/{module}/
├── domain/
│   ├── entities/
│   │   └── {entity}.entity.ts
│   ├── value-objects/
│   │   └── {value-object}.ts
│   ├── repositories/
│   │   └── {entity}.repository.ts      # Interface
│   └── index.ts
│
├── application/
│   ├── dto/
│   │   ├── create-{entity}.dto.ts
│   │   ├── update-{entity}.dto.ts
│   │   └── index.ts
│   ├── services/
│   │   └── {module}.service.ts
│   └── index.ts
│
├── infrastructure/
│   ├── prisma/
│   │   ├── {entity}.repository.ts      # Implementation
│   │   └── prisma-{module}.mapper.ts
│   ├── external/
│   │   └── {external-service}.ts
│   └── index.ts
│
├── presentation/
│   ├── http/
│   │   ├── {module}.controller.ts
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   │   ├── create-{entity}.request.dto.ts
│   │   │   │   └── update-{entity}.request.dto.ts
│   │   │   └── response/
│   │   │       └── {entity}.response.dto.ts
│   │   └── index.ts
│   └── index.ts
│
├── {module}.module.ts
└── index.ts
```

---

## Contoh Implementasi

### 1. Domain Layer

```typescript
// domain/entities/supplier.entity.ts
export class Supplier {
  constructor(
    public readonly id: string,
    public name: string,
    public npwp: string,
    public phone?: string,
    public address?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  updateName(name: string): void {
    this.name = name;
    this.updatedAt = new Date();
  }
}

// domain/repositories/supplier.repository.ts
import { Supplier } from '../entities';

export interface SupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  create(supplier: Supplier): Promise<Supplier>;
  update(id: string, data: Partial<Supplier>): Promise<Supplier>;
  delete(id: string): Promise<void>;
}
```

### 2. Application Layer

```typescript
// application/dto/create-supplier.dto.ts
export class CreateSupplierDto {
  name: string;
  npwp: string;
  phone?: string;
  address?: string;
}

// application/services/supplier.service.ts
import { Supplier } from '../domain';
import { SupplierRepository } from '../domain';
import { CreateSupplierDto } from '../dto';

export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.supplierRepository.findAll();
  }

  async findById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = new Supplier(
      crypto.randomUUID(),
      dto.name,
      dto.npwp,
      dto.phone,
      dto.address,
    );
    return this.supplierRepository.create(supplier);
  }
}
```

### 3. Infrastructure Layer

```typescript
// infrastructure/prisma/supplier.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SupplierRepository } from '../../domain';
import { Supplier } from '../../domain';

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Supplier[]> {
    const suppliers = await this.prisma.supplier.findMany();
    return suppliers.map((s) => this.toDomain(s));
  }

  async findById(id: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });
    return supplier ? this.toDomain(supplier) : null;
  }

  private toDomain(prismaSupplier: any): Supplier {
    return new Supplier(
      prismaSupplier.id,
      prismaSupplier.name,
      prismaSupplier.npwp,
      prismaSupplier.phone,
      prismaSupplier.address,
      prismaSupplier.createdAt,
      prismaSupplier.updatedAt,
    );
  }
}
```

### 4. Presentation Layer

```typescript
// presentation/http/supplier.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SupplierService } from '../../application';

@Controller('suppliers')
@ApiTags('Suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: 'List all suppliers' })
  async findAll() {
    return this.supplierService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  async findById(@Param('id') id: string) {
    return this.supplierService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create supplier' })
  async create(@Body() body: CreateSupplierRequestDto) {
    return this.supplierService.create(body);
  }
}
```

### 5. Module

```typescript
// {module}.module.ts
import { Module } from '@nestjs/common';
import { SupplierController } from './presentation/http';
import { SupplierService } from './application';
import { PrismaSupplierRepository } from './infrastructure';
import { SupplierRepository } from './domain';

@Module({
  controllers: [SupplierController],
  providers: [
    SupplierService,
    {
      provide: SupplierRepository,
      useClass: PrismaSupplierRepository,
    },
  ],
  exports: [SupplierService],
})
export class SupplierModule {}
```

---

## Checklist

- [ ] Buat folder structure sesuai template
- [ ] Buat domain entity dengan constructor
- [ ] Buat repository interface di domain
- [ ] Buat service di application
- [ ] Buat DTO untuk request/response
- [ ] Buat repository implementation di infrastructure
- [ ] Buat controller di presentation
- [ ] Buat module file
- [ ] Export semua public API via index.ts
- [ ] Register module di app.module.ts

---

## Anti-Patterns

```
❌ Domain import PrismaClient
   import { PrismaClient } from '@prisma/client';

✅ Domain define interface only
   export interface SupplierRepository { ... }

❌ Application import infrastructure
   import { PrismaSupplierRepository } from '../infrastructure';

✅ Application depend on interface
   constructor(private readonly repo: SupplierRepository) {}

❌ Controller contain business logic
   async findAll() {
     const data = await this.prisma.supplier.findMany(); // NO!
     return data;
   }

✅ Controller delegate to service
   async findAll() {
     return this.supplierService.findAll();
   }
```

---

## References

- [NestJS Modules](https://docs.nestjs.com/modules)
- [DDD Layers](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
- [docs/backend/MCP.md](../MCP.md)
