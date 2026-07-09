# mapper-pattern

## Tujuan

Mapping data antara Domain Entity ↔ Prisma Model ↔ Response DTO secara konsisten.

---

## Aturan

```
┌─────────────────────────────────────────────────────────────┐
│  MAPPER PATTERN RULES                                       │
├─────────────────────────────────────────────────────────────┤
│  1. Buat mapper class untuk setiap entity                   │
│  2. Gunakan @Injectable() untuk mapper                      │
│  3. Domain entity tidak boleh tahu Prisma model             │
│  4. Response DTO tidak boleh tahu Prisma model              │
│  5. Map semua fields termasuk timestamps                    │
│  6. Handle optional fields dengan benar                     │
│  7. Jangan map password atau sensitive data                 │
│  8. Test mapper dengan berbagai input                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Template

### Prisma Mapper

```typescript
// infrastructure/prisma/prisma-supplier.mapper.ts
import { Injectable } from '@nestjs/common';
import { Supplier } from '../../domain/entities';
import { Supplier as PrismaSupplier } from '@prisma/client';

@Injectable()
export class SupplierMapper {
  /**
   * Map Prisma model to Domain entity
   */
  toDomain(prismaSupplier: PrismaSupplier): Supplier {
    return new Supplier({
      id: prismaSupplier.id,
      name: prismaSupplier.name,
      npwp: prismaSupplier.npwp,
      phone: prismaSupplier.phone ?? undefined,
      address: prismaSupplier.address ?? undefined,
      createdAt: prismaSupplier.createdAt,
      updatedAt: prismaSupplier.updatedAt,
    });
  }

  /**
   * Map Domain entity to Prisma create input
   */
  toPrismaCreate(supplier: Supplier): PrismaSupplierCreateInput {
    return {
      id: supplier.id,
      name: supplier.name,
      npwp: supplier.npwp,
      phone: supplier.phone,
      address: supplier.address,
    };
  }

  /**
   * Map Domain entity to Prisma update input
   */
  toPrismaUpdate(supplier: Partial<Supplier>): PrismaSupplierUpdateInput {
    const data: PrismaSupplierUpdateInput = {};

    if (supplier.name !== undefined) data.name = supplier.name;
    if (supplier.phone !== undefined) data.phone = supplier.phone;
    if (supplier.address !== undefined) data.address = supplier.address;

    return data;
  }
}
```

### Response Mapper

```typescript
// presentation/http/dto/response/supplier-response.mapper.ts
import { Injectable } from '@nestjs/common';
import { Supplier } from '../../../domain/entities';
import { SupplierResponseDto } from './supplier.response.dto';

@Injectable()
export class SupplierResponseMapper {
  /**
   * Map Domain entity to Response DTO
   */
  toResponse(supplier: Supplier): SupplierResponseDto {
    return {
      id: supplier.id,
      name: supplier.name,
      npwp: supplier.npwp,
      phone: supplier.phone,
      address: supplier.address,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    };
  }

  /**
   * Map array of Domain entities to Response DTOs
   */
  toResponseArray(suppliers: Supplier[]): SupplierResponseDto[] {
    return suppliers.map((s) => this.toResponse(s));
  }
}
```

### Request Mapper

```typescript
// presentation/http/dto/request/supplier-request.mapper.ts
import { Injectable } from '@nestjs/common';
import { CreateSupplierRequestDto, UpdateSupplierRequestDto } from './supplier.request.dto';
import { CreateSupplierData, UpdateSupplierData } from '../../../domain/repositories';

@Injectable()
export class SupplierRequestMapper {
  /**
   * Map Create Request DTO to Domain data
   */
  toCreateData(dto: CreateSupplierRequestDto): CreateSupplierData {
    return {
      name: dto.name,
      npwp: dto.npwp,
      phone: dto.phone,
      address: dto.address,
    };
  }

  /**
   * Map Update Request DTO to Domain data
   */
  toUpdateData(dto: UpdateSupplierRequestDto): UpdateSupplierData {
    const data: UpdateSupplierData = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.address !== undefined) data.address = dto.address;

    return data;
  }
}
```

---

## Complete Usage Example

```typescript
// application/services/supplier.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupplierRepository } from '../../domain';
import { SupplierMapper } from '../../infrastructure';
import { SupplierResponseMapper } from '../mappers';
import { 
  CreateSupplierRequestDto,
  UpdateSupplierRequestDto,
  FindAllSuppliersRequestDto,
} from '../dto';

@Injectable()
export class SupplierService {
  constructor(
    private readonly supplierRepository: SupplierRepository,
    private readonly prismaMapper: SupplierMapper,
    private readonly responseMapper: SupplierResponseMapper,
    private readonly requestMapper: SupplierRequestMapper,
  ) {}

  async findAll(query: FindAllSuppliersRequestDto) {
    const suppliers = await this.supplierRepository.findAll({
      skip: query.skip,
      take: query.take,
      where: { name: { contains: query.search, mode: 'insensitive' } },
    });

    return this.responseMapper.toResponseArray(suppliers);
  }

  async findById(id: string) {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return this.responseMapper.toResponse(supplier);
  }

  async create(dto: CreateSupplierRequestDto) {
    const data = this.requestMapper.toCreateData(dto);
    const supplier = await this.supplierRepository.create(data);
    
    return this.responseMapper.toResponse(supplier);
  }

  async update(id: string, dto: UpdateSupplierRequestDto) {
    const existing = await this.supplierRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Supplier not found');
    }

    const data = this.requestMapper.toUpdateData(dto);
    const supplier = await this.supplierRepository.update(id, data);
    
    return this.responseMapper.toResponse(supplier);
  }

  async delete(id: string) {
    const existing = await this.supplierRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Supplier not found');
    }

    await this.supplierRepository.delete(id);
  }
}
```

---

## Mapping with Relations

```typescript
// infrastructure/prisma/batch.mapper.ts
import { Injectable } from '@nestjs/common';
import { Batch } from '../../domain/entities';
import { Batch as PrismaBatch, Sppg as PrismaSppg } from '@prisma/client';
import { SppgMapper } from './sppg.mapper';

type PrismaBatchWithRelations = PrismaBatch & {
  sppg?: PrismaSppg;
  items?: any[];
};

@Injectable()
export class BatchMapper {
  constructor(private readonly sppgMapper: SppgMapper) {}

  toDomain(prismaBatch: PrismaBatchWithRelations): Batch {
    return new Batch({
      id: prismaBatch.id,
      batchNumber: prismaBatch.batchNumber,
      date: prismaBatch.date,
      status: prismaBatch.status as BatchStatus,
      sppg: prismaBatch.sppg 
        ? this.sppgMapper.toDomain(prismaBatch.sppg)
        : undefined,
      items: prismaBatch.items?.map((item) => this.toItemDomain(item)),
      createdAt: prismaBatch.createdAt,
      updatedAt: prismaBatch.updatedAt,
    });
  }

  private toItemDomain(item: any) {
    return new BatchItem({
      id: item.id,
      itemId: item.itemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
  }
}
```

---

## Checklist

- [ ] Buat Prisma mapper untuk Domain ↔ Prisma
- [ ] Buat Response mapper untuk Domain → Response DTO
- [ ] Buat Request mapper untuk Request DTO → Domain
- [ ] Gunakan @Injectable() untuk semua mapper
- [ ] Map semua fields termasuk timestamps
- [ ] Handle optional fields dengan benar
- [ ] Buat toResponseArray untuk array mapping
- [ ] Handle relations dengan nested mapper

---

## Anti-Patterns

```
❌ Map langsung di service
async findAll() {
  const suppliers = await this.prisma.supplier.findMany();
  return suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    npwp: s.npwp,
    // ... lots of mapping code
  }));
}

✅ Gunakan mapper
async findAll() {
  const suppliers = await this.supplierRepository.findAll();
  return this.responseMapper.toResponseArray(suppliers);
}

❌ Mapper return any
toDomain(data: any): any {
  return { id: data.id, name: data.name };
}

✅ Mapper return typed
toDomain(prismaSupplier: PrismaSupplier): Supplier {
  return new Supplier({
    id: prismaSupplier.id,
    name: prismaSupplier.name,
    npwp: prismaSupplier.npwp,
  });
}

❌ Map sensitive data
toResponse(supplier: Supplier) {
  return {
    id: supplier.id,
    password: supplier.password, // NO!
    token: supplier.token, // NO!
  };
}

✅ Exclude sensitive data
toResponse(supplier: Supplier) {
  return {
    id: supplier.id,
    name: supplier.name,
  };
}
```

---

## References

- [Mapper Pattern](https://wwwPatterns.com/mapper)
- [Object-Relational Mapping](https://en.wikipedia.org/wiki/Object-relational_mapping)
- [NestJS DTOs](https://docs.nestjs.com/techniques/validation)
- [docs/backend/PATTERNS.md](../PATTERNS.md)
